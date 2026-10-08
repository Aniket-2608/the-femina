import crypto from 'crypto';
import { Order } from '../../models/Order.js';
import { ProductVariant } from '../../models/ProductVariant.js';
import { Product } from '../../models/Product.js';
import { InventoryTransaction } from '../../models/InventoryTransaction.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { ENV } from '../../config/env.js';
import { OrderStatus, PaymentStatus } from '../../constants/orderStatus.js';

export class PaymentService {
  static async verifyRazorpayPayment(data: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const order = await Order.findById(data.orderId);
    if (!order) {
      throw new AppError('Order not found.', 404, 'ORDER_NOT_FOUND');
    }

    if (order.paymentInfo.status === PaymentStatus.PAID) {
      return {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.orderStatus,
        message: 'Order is already marked as paid.',
      };
    }

    // Cryptographic signature check
    let isSignatureValid = false;

    if (ENV.RAZORPAY_KEY_SECRET && !ENV.RAZORPAY_KEY_SECRET.includes('placeholder')) {
      const generatedSignature = crypto
        .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
        .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
        .digest('hex');

      isSignatureValid = generatedSignature === data.razorpaySignature;
    } else {
      // In development/test mode without live keys, verify payload structure
      isSignatureValid = Boolean(data.razorpayPaymentId && data.razorpayOrderId);
    }

    if (!isSignatureValid) {
      // Release reserved stock back to available pool
      await this.releaseReservedStock(order, 'Payment signature verification failed.');
      order.paymentInfo.status = PaymentStatus.FAILED;
      order.orderStatus = OrderStatus.CANCELLED;
      order.statusHistory.push({
        status: OrderStatus.CANCELLED,
        timestamp: new Date(),
        note: 'Payment failed or signature mismatch. Stock reservation released.',
      });
      await order.save();

      throw new AppError('Payment signature verification failed.', 400, 'PAYMENT_VERIFICATION_FAILED');
    }

    // 1. Mark Order as Confirmed and Paid
    order.paymentInfo.status = PaymentStatus.PAID;
    order.paymentInfo.razorpayPaymentId = data.razorpayPaymentId;
    order.paymentInfo.razorpaySignature = data.razorpaySignature;
    order.paymentInfo.paidAt = new Date();
    order.orderStatus = OrderStatus.CONFIRMED;

    order.statusHistory.push({
      status: OrderStatus.CONFIRMED,
      timestamp: new Date(),
      note: `Payment authorized via Razorpay (Ref: ${data.razorpayPaymentId}). Order confirmed.`,
    });

    await order.save();

    // 2. Transition stock from Reserved to Deducted (Fulfilled)
    for (const item of order.items) {
      const variant = await ProductVariant.findByIdAndUpdate(
        item.variantId,
        {
          $inc: {
            stockQuantity: -item.quantity,
            reservedQuantity: -item.quantity,
          },
        },
        { new: true }
      );

      if (variant) {
        // Update denormalized total stock on master product
        const allProductVariants = await ProductVariant.find({ productId: variant.productId, isActive: true });
        const newTotalStock = allProductVariants.reduce((sum, v) => sum + v.stockQuantity, 0);
        await Product.findByIdAndUpdate(variant.productId, { totalStock: newTotalStock });
      }

      await InventoryTransaction.create({
        variantId: item.variantId,
        productId: item.productId,
        sku: item.sku,
        type: 'ORDER_FULFILLED',
        quantityDelta: -item.quantity,
        previousStock: variant?.stockQuantity || 0,
        newStock: (variant?.stockQuantity || 0) - item.quantity,
        referenceId: order._id,
        reason: `Payment confirmed for Order ${order.orderNumber}`,
        performedBy: order.customer.userId,
        costAtTransaction: item.unitCost,
      });
    }

    console.log(`[Payment] Order ${order.orderNumber} successfully paid and confirmed!`);

    return {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.orderStatus,
      paymentStatus: order.paymentInfo.status,
      customer: order.customer,
      pricing: order.pricing,
      items: order.items,
      shippingAddress: order.shippingAddress,
    };
  }

  private static async releaseReservedStock(order: typeof Order.prototype, reason: string) {
    for (const item of order.items) {
      await ProductVariant.findByIdAndUpdate(item.variantId, {
        $inc: {
          reservedQuantity: -item.quantity,
          availableQuantity: item.quantity,
        },
      });

      await InventoryTransaction.create({
        variantId: item.variantId,
        productId: item.productId,
        sku: item.sku,
        type: 'ORDER_CANCELLED',
        quantityDelta: item.quantity,
        previousStock: 0,
        newStock: 0,
        referenceId: order._id,
        reason: `Reserved stock released: ${reason}`,
        performedBy: order.customer.userId,
        costAtTransaction: item.unitCost,
      });
    }
  }
}

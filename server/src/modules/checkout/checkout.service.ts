import { Types } from 'mongoose';
import Razorpay from 'razorpay';
import { Product } from '../../models/Product.js';
import { ProductVariant } from '../../models/ProductVariant.js';
import { Order, IOrderItem } from '../../models/Order.js';
import { InventoryTransaction } from '../../models/InventoryTransaction.js';
import { User } from '../../models/User.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { ENV } from '../../config/env.js';
import { OrderStatus, PaymentStatus } from '../../constants/orderStatus.js';

let razorpayClient: Razorpay | null = null;
if (ENV.RAZORPAY_KEY_ID && !ENV.RAZORPAY_KEY_ID.includes('placeholder')) {
  razorpayClient = new Razorpay({
    key_id: ENV.RAZORPAY_KEY_ID,
    key_secret: ENV.RAZORPAY_KEY_SECRET,
  });
}

export interface CartInputItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export class CheckoutService {
  static async validateCart(items: CartInputItem[]) {
    let subtotal = 0;
    const validatedItems = [];
    const stockErrors = [];

    for (const item of items) {
      if (!Types.ObjectId.isValid(item.productId) || !Types.ObjectId.isValid(item.variantId)) {
        throw new AppError('Invalid product or variant ID in cart.', 400, 'INVALID_ITEM_ID');
      }

      const [product, variant] = await Promise.all([
        Product.findById(item.productId),
        ProductVariant.findById(item.variantId),
      ]);

      if (!product || !product.isPublished || !variant || !variant.isActive) {
        stockErrors.push({
          productId: item.productId,
          variantId: item.variantId,
          error: 'Item is no longer available.',
        });
        continue;
      }

      if (variant.availableQuantity < item.quantity) {
        stockErrors.push({
          productId: item.productId,
          variantId: item.variantId,
          name: product.name,
          requested: item.quantity,
          available: variant.availableQuantity,
          error: `Only ${variant.availableQuantity} units available in stock.`,
        });
      }

      const itemTotal = variant.price * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        productId: product._id,
        variantId: variant._id,
        productName: product.name,
        slug: product.slug,
        sku: variant.sku,
        color: variant.color.name,
        colorHex: variant.color.hexCode,
        size: variant.size,
        image: variant.images?.[0] || product.images?.[0]?.url || '',
        unitPrice: variant.price,
        unitCost: variant.costPrice,
        quantity: item.quantity,
        subtotal: itemTotal,
        availableStock: variant.availableQuantity,
      });
    }

    if (stockErrors.length > 0) {
      throw new AppError(
        'Some items in your cart have stock availability issues.',
        400,
        'STOCK_VALIDATION_FAILED',
        stockErrors
      );
    }

    // Business Rules: Free express shipping above ₹2,999, else ₹199
    const shippingCharges = subtotal >= 2999 || subtotal === 0 ? 0 : 199;
    const discountAmount = 0;
    const taxAmount = 0; // Inclusive in luxury retail pricing
    const totalPayable = subtotal + shippingCharges - discountAmount;

    return {
      items: validatedItems,
      pricing: {
        itemsSubtotal: subtotal,
        discountAmount,
        shippingCharges,
        taxAmount,
        totalPayable,
      },
    };
  }

  static async createOrder(
    userId: string,
    data: {
      items: CartInputItem[];
      shippingAddress: {
        fullName: string;
        phone: string;
        addressLine1: string;
        addressLine2?: string;
        landmark?: string;
        city: string;
        state: string;
        pincode: string;
      };
      noReturnAcknowledged: boolean;
    }
  ) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('Customer user account not found.', 404, 'USER_NOT_FOUND');

    // 1. Re-validate cart server-side
    const validated = await this.validateCart(data.items);
    const totalPaise = Math.round(validated.pricing.totalPayable * 100);

    // 2. Generate unique order sequence number
    const timestamp = Date.now().toString().slice(-6);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `TFE-${timestamp}-${randomSuffix}`;

    // 3. Create Razorpay Order
    let razorpayOrderId = `rzp_order_mock_${Date.now()}`;
    if (razorpayClient) {
      try {
        const rzpOrder = await razorpayClient.orders.create({
          amount: totalPaise,
          currency: 'INR',
          receipt: orderNumber,
          notes: {
            customerName: data.shippingAddress.fullName,
            customerEmail: user.email,
          },
        });
        razorpayOrderId = rzpOrder.id;
      } catch (err) {
        console.error('[Razorpay] Order creation failed:', err);
        throw new AppError('Failed to initiate payment gateway. Please try again.', 500, 'GATEWAY_ERROR');
      }
    }

    // 4. Reserve stock atomically for all variants
    const orderItems: IOrderItem[] = [];
    for (const item of validated.items) {
      const updatedVariant = await ProductVariant.findOneAndUpdate(
        {
          _id: item.variantId,
          availableQuantity: { $gte: item.quantity },
        },
        {
          $inc: {
            reservedQuantity: item.quantity,
            availableQuantity: -item.quantity,
          },
        },
        { new: true }
      );

      if (!updatedVariant) {
        throw new AppError(
          `Stock for ${item.productName} (${item.size}) was just sold out. Please refresh your cart.`,
          409,
          'STOCK_EXHAUSTED'
        );
      }

      orderItems.push({
        productId: item.productId as Types.ObjectId,
        variantId: item.variantId as Types.ObjectId,
        productName: item.productName,
        sku: item.sku,
        color: item.color,
        size: item.size,
        image: item.image,
        unitPrice: item.unitPrice,
        unitCost: item.unitCost,
        quantity: item.quantity,
        subtotal: item.subtotal,
      });
    }

    // 5. Create Order in Database
    const newOrder = await Order.create({
      orderNumber,
      customer: {
        userId: user._id,
        fullName: data.shippingAddress.fullName,
        email: user.email,
        phone: data.shippingAddress.phone,
      },
      items: orderItems,
      shippingAddress: data.shippingAddress,
      pricing: validated.pricing,
      paymentInfo: {
        method: 'RAZORPAY',
        razorpayOrderId,
        status: PaymentStatus.PENDING,
      },
      orderStatus: OrderStatus.PAYMENT_PENDING,
      statusHistory: [
        {
          status: OrderStatus.PAYMENT_PENDING,
          timestamp: new Date(),
          note: 'Order created, awaiting payment authorization.',
        },
      ],
      policyAcknowledgement: {
        noReturnAcknowledged: data.noReturnAcknowledged,
        acknowledgedAt: new Date(),
      },
    });

    // 6. Record Inventory Reservation Transactions
    for (const item of orderItems) {
      await InventoryTransaction.create({
        variantId: item.variantId,
        productId: item.productId,
        sku: item.sku,
        type: 'ORDER_RESERVED',
        quantityDelta: -item.quantity,
        previousStock: 0, // Reference delta
        newStock: 0,
        referenceId: newOrder._id,
        reason: `Reserved for Order ${orderNumber}`,
        performedBy: user._id,
        costAtTransaction: item.unitCost,
      });
    }

    return {
      orderId: newOrder._id,
      orderNumber: newOrder.orderNumber,
      razorpayOrderId,
      amount: validated.pricing.totalPayable,
      amountInPaise: totalPaise,
      currency: 'INR',
      razorpayKeyId: ENV.RAZORPAY_KEY_ID,
      customer: {
        name: data.shippingAddress.fullName,
        email: user.email,
        phone: data.shippingAddress.phone,
      },
      pricing: validated.pricing,
    };
  }
}

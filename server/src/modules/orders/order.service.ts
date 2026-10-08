import { Order } from '../../models/Order.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class OrderService {
  static async getMyOrders(userId: string) {
    const orders = await Order.find({ 'customer.userId': userId })
      .sort({ createdAt: -1 })
      .select('-internalNotes')
      .lean();

    return orders;
  }

  static async getOrderById(orderId: string, userId: string) {
    const order = await Order.findOne({
      _id: orderId,
      'customer.userId': userId,
    })
      .select('-internalNotes')
      .lean();

    if (!order) {
      throw new AppError('Order not found.', 404, 'ORDER_NOT_FOUND');
    }

    return order;
  }
}

import { Request, Response, NextFunction } from 'express';
import { OrderService } from './order.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class OrderController {
  static async getMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const orders = await OrderService.getMyOrders(req.user.userId);
      return ApiResponse.success(res, 'Orders retrieved', orders);
    } catch (error) {
      return next(error);
    }
  }

  static async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const { orderId } = req.params;
      const order = await OrderService.getOrderById(orderId, req.user.userId);
      return ApiResponse.success(res, 'Order details retrieved', order);
    } catch (error) {
      return next(error);
    }
  }
}

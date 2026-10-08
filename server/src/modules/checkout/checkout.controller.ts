import { Request, Response, NextFunction } from 'express';
import { CheckoutService } from './checkout.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class CheckoutController {
  static async validateCart(req: Request, res: Response, next: NextFunction) {
    try {
      const { items } = req.body;
      const result = await CheckoutService.validateCart(items);
      return ApiResponse.success(res, 'Cart validated successfully', result);
    } catch (error) {
      return next(error);
    }
  }

  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Authentication required to checkout.', 401);
      const result = await CheckoutService.createOrder(req.user.userId, req.body);
      return ApiResponse.success(res, 'Order initiated successfully', result, 201);
    } catch (error) {
      return next(error);
    }
  }
}

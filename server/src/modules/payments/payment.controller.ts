import { Request, Response, NextFunction } from 'express';
import { PaymentService } from './payment.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';

export class PaymentController {
  static async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PaymentService.verifyRazorpayPayment(req.body);
      return ApiResponse.success(res, 'Payment verified successfully. Your order is confirmed!', result);
    } catch (error) {
      return next(error);
    }
  }
}

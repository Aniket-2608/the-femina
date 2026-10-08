import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { User } from '../../models/User.js';
import { AppError } from '../../middlewares/errorHandler.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      return ApiResponse.success(res, 'Account created. Please verify your email and phone OTP.', result, 201);
    } catch (error) {
      return next(error);
    }
  }

  static async verifyEmailOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const result = await AuthService.verifyEmailOtp(email, otp);
      return ApiResponse.success(res, 'Email successfully verified.', result);
    } catch (error) {
      return next(error);
    }
  }

  static async verifyPhoneOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, otp } = req.body;
      const result = await AuthService.verifyPhoneOtp(phone, otp);
      return ApiResponse.success(res, 'Phone number successfully verified.', result);
    } catch (error) {
      return next(error);
    }
  }

  static async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.resendOtp(req.body);
      return ApiResponse.success(res, result.message, result);
    } catch (error) {
      return next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return ApiResponse.success(res, 'Welcome back to The Femina Exclusive.', result);
    } catch (error) {
      return next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }
      const user = await User.findById(req.user.userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      return ApiResponse.success(res, 'Profile retrieved', { user });
    } catch (error) {
      return next(error);
    }
  }

  static async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const { firstName, lastName } = req.body;
      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { firstName, lastName },
        { new: true }
      );
      return ApiResponse.success(res, 'Profile updated successfully', { user });
    } catch (error) {
      return next(error);
    }
  }

  static async addAddress(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const user = await User.findById(req.user.userId);
      if (!user) throw new AppError('User not found', 404);

      const newAddress = req.body;
      if (newAddress.isDefault || user.savedAddresses.length === 0) {
        user.savedAddresses.forEach((a) => (a.isDefault = false));
        newAddress.isDefault = true;
      }

      user.savedAddresses.push(newAddress);
      await user.save();

      return ApiResponse.success(res, 'Delivery address added successfully', {
        savedAddresses: user.savedAddresses,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401);
      const { addressId } = req.params;
      const user = await User.findById(req.user.userId);
      if (!user) throw new AppError('User not found', 404);

      user.savedAddresses = user.savedAddresses.filter((a) => a._id?.toString() !== addressId);
      await user.save();

      return ApiResponse.success(res, 'Address deleted successfully', {
        savedAddresses: user.savedAddresses,
      });
    } catch (error) {
      return next(error);
    }
  }
}

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../constants/roles.js';
import { AppError } from './errorHandler.js';

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access forbidden: Role '${req.user.role}' is not authorized to access this resource.`,
          403,
          'FORBIDDEN'
        )
      );
    }

    return next();
  };
};

export const requireVerified = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
  }

  if (!req.user.isEmailVerified || !req.user.isPhoneVerified) {
    return next(
      new AppError(
        'Account verification required. Please complete email and phone verification before proceeding.',
        403,
        'VERIFICATION_REQUIRED',
        {
          isEmailVerified: req.user.isEmailVerified,
          isPhoneVerified: req.user.isPhoneVerified,
        }
      )
    );
  }

  return next();
};

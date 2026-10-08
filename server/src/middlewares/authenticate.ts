import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokenUtils.js';
import { AppError } from './errorHandler.js';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // 1. Check Authorization header: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      // 2. Check cookies
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(new AppError('Authentication required. Please sign in.', 401, 'UNAUTHORIZED'));
    }

    const payload = verifyAccessToken(token);
    req.user = payload;
    return next();
  } catch (err: unknown) {
    return next(new AppError('Invalid or expired authentication session. Please sign in again.', 401, 'INVALID_TOKEN', err));
  }
};

export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const payload = verifyAccessToken(token);
      req.user = payload;
    }
  } catch {
    // If token invalid, simply proceed as unauthenticated guest
    req.user = undefined;
  }
  return next();
};

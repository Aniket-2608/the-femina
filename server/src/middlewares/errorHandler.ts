import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';
import { ENV } from '../config/env.js';

export class AppError extends Error {
  statusCode: number;
  code: string;
  errors?: unknown;

  constructor(message: string, statusCode: number = 500, code: string = 'ERROR', errors?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const statusCode = (err as AppError).statusCode || 500;
  const code = (err as AppError).code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';
  const errors = (err as AppError).errors;

  if (ENV.NODE_ENV === 'development') {
    console.error(`[Error] ${req.method} ${req.url} -> ${statusCode} [${code}]:`, err);
  }

  return ApiResponse.error(res, message, statusCode, code, errors);
};

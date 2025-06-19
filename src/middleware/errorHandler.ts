import { Request, Response, NextFunction } from 'express';
import logger from '@/config/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const createError = (
  message: string,
  statusCode: number = 500
): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  const isProduction = process.env['NODE_ENV'] === 'production';

  // Don't leak error details in production
  const errorResponse = {
    success: false,
    message:
      isProduction && statusCode === 500 ? 'Internal Server Error' : message,
    ...(process.env['NODE_ENV'] !== 'production' && { stack: err.stack }),
  };

  res.status(statusCode).json(errorResponse);
};

export const notFoundHandler = (
  req: Request,
  _: Response,
  next: NextFunction
): void => {
  const error = createError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

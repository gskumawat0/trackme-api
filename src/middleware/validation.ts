import { Request, Response, NextFunction } from 'express';
import { Schema } from 'yup';
import { createError } from './errorHandler';

export const validate = (schema: Schema) => {
  return async (req: Request, _: Response, next: NextFunction) => {
    try {
      await schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      next();
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        const errors = error.errors.map((err: string) => err);
        const errorMessage = errors.join(', ');
        next(createError(`Validation failed: ${errorMessage}`, 400));
      } else {
        next(error);
      }
    }
  };
};

export const validateQuery = (schema: Schema) => {
  return async (req: Request, _: Response, next: NextFunction) => {
    try {
      await schema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });

      next();
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        const errors = error.errors.map((err: string) => err);
        const errorMessage = errors.join(', ');
        next(createError(`Query validation failed: ${errorMessage}`, 400));
      } else {
        next(error);
      }
    }
  };
};

export const validateParams = (schema: Schema) => {
  return async (req: Request, _: Response, next: NextFunction) => {
    try {
      await schema.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
      });

      next();
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        const errors = error.errors.map((err: string) => err);
        const errorMessage = errors.join(', ');
        next(createError(`Parameter validation failed: ${errorMessage}`, 400));
      } else {
        next(error);
      }
    }
  };
};

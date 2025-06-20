import * as yup from 'yup';
import { Frequency } from '@/types';

export const createActivitySchema = yup.object({
  title: yup
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .required('Title is required'),
  description: yup
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  frequency: yup
    .string()
    .oneOf(Object.values(Frequency), 'Invalid frequency')
    .default(Frequency.DAILY),
  duration: yup
    .number()
    .positive('Duration must be positive')
    .integer('Duration must be an integer')
    .optional(),
  category: yup
    .string()
    .max(100, 'Category must be less than 100 characters')
    .optional(),
  startDate: yup.date().optional(),
  endDate: yup
    .date()
    .min(yup.ref('startDate'), 'End date must be after start date')
    .optional(),
});

export const updateActivitySchema = yup.object({
  title: yup
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  description: yup
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  frequency: yup
    .string()
    .oneOf(Object.values(Frequency), 'Invalid frequency')
    .optional(),
  duration: yup
    .number()
    .positive('Duration must be positive')
    .integer('Duration must be an integer')
    .optional(),
  category: yup
    .string()
    .max(100, 'Category must be less than 100 characters')
    .optional(),
  startDate: yup.date().optional(),
  endDate: yup
    .date()
    .min(yup.ref('startDate'), 'End date must be after start date')
    .optional(),
});

export const activityQuerySchema = yup.object({
  frequency: yup
    .string()
    .oneOf(Object.values(Frequency), 'Invalid frequency')
    .optional(),
  category: yup
    .string()
    .max(100, 'Category must be less than 100 characters')
    .optional(),
  includeRollover: yup
    .boolean()
    .transform(value => value === 'true')
    .default(false),
  startDate: yup.date().optional(),
  endDate: yup.date().optional(),
});

export const activityParamsSchema = yup.object({
  id: yup.string().required('Activity ID is required'),
});

export type CreateActivityRequest = yup.InferType<typeof createActivitySchema>;
export type UpdateActivityRequest = yup.InferType<typeof updateActivitySchema>;
export type ActivityQueryRequest = yup.InferType<typeof activityQuerySchema>;
export type ActivityParamsRequest = yup.InferType<typeof activityParamsSchema>;

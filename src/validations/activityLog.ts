import * as yup from 'yup';
import { ActivityStatus } from '@/types';

export const updateActivityLogStatusSchema = yup.object({
  status: yup
    .string()
    .oneOf(Object.values(ActivityStatus), 'Invalid status')
    .required('Status is required'),
});

export const createActivityLogCommentSchema = yup.object({
  comment: yup
    .string()
    .min(1, 'Comment is required')
    .max(1000, 'Comment must be less than 1000 characters')
    .required('Comment is required'),
});

export const activityLogQuerySchema = yup.object({
  activityId: yup.string().optional(),
  status: yup
    .string()
    .oneOf(Object.values(ActivityStatus), 'Invalid status')
    .optional(),
  startDate: yup.date().optional(),
  endDate: yup.date().optional(),
  comments: yup
    .boolean()
    .transform((value: any) => value === 'true')
    .default(false),
});

export const activityLogParamsSchema = yup.object({
  id: yup.string().required('Activity log ID is required'),
});

export const activityLogCommentParamsSchema = yup.object({
  id: yup.string().required('Activity log ID is required'),
  commentId: yup.string().required('Comment ID is required'),
});

export type UpdateActivityLogStatusRequest = yup.InferType<
  typeof updateActivityLogStatusSchema
>;
export type CreateActivityLogCommentRequest = yup.InferType<
  typeof createActivityLogCommentSchema
>;
export type ActivityLogQueryRequest = yup.InferType<
  typeof activityLogQuerySchema
>;
export type ActivityLogParamsRequest = yup.InferType<
  typeof activityLogParamsSchema
>;
export type ActivityLogCommentParamsRequest = yup.InferType<
  typeof activityLogCommentParamsSchema
>;

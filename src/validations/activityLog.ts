import * as yup from 'yup';
import { ActivityStatus, Frequency } from '@/types';

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
  page: yup
    .number()
    .positive('Page must be positive')
    .integer('Page must be an integer')
    .default(1),
  limit: yup
    .number()
    .positive('Limit must be positive')
    .integer('Limit must be an integer')
    .max(100, 'Limit must be less than or equal to 100')
    .default(10),
});

export const todayActivityLogQuerySchema = yup.object({
  activityId: yup.string().optional(),
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

export const generateActivityLogsSchema = yup.object({
  startDate: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .optional(),
  endDate: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .optional(),
  date: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  frequency: yup
    .string()
    .oneOf(Object.values(Frequency), 'Invalid frequency')
    .optional(),
}).test('date-validation', 'Either provide startDate and endDate, or date', function(value) {
  const { startDate, endDate } = value;
  
  // If startDate is provided, endDate must also be provided
  if (startDate && !endDate) {
    return this.createError({ message: 'End date is required when start date is provided' });
  }
  
  // If endDate is provided, startDate must also be provided
  if (endDate && !startDate) {
    return this.createError({ message: 'Start date is required when end date is provided' });
  }
  
  // If neither startDate/endDate nor date is provided, that's also valid (will use current date)
  return true;
});

export const createExcludedIntervalSchema = yup.object({
  frequency: yup
    .string()
    .oneOf(Object.values(Frequency), 'Invalid frequency')
    .required('Frequency is required'),
  type: yup
    .string()
    .oneOf(['DAY_OF_WEEK', 'WEEK_OF_YEAR', 'MONTH'], 'Type must be either DAY_OF_WEEK, WEEK_OF_YEAR, or MONTH')
    .required('Type is required'),
  value: yup
    .number()
    .integer('Value must be an integer')
    .required('Value is required')
    .test('value-range', 'Invalid value for the specified type', function(value) {
      const type = this.parent.type;
      if (type === 'DAY_OF_WEEK') {
        return value >= 0 && value <= 6;
      } else if (type === 'WEEK_OF_YEAR') {
        return value >= 1 && value <= 52;
      } else if (type === 'MONTH') {
        return value >= 1 && value <= 12;
      }
      return false;
    }),
});

export const excludedIntervalParamsSchema = yup.object({
  id: yup.string().required('Excluded interval ID is required'),
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

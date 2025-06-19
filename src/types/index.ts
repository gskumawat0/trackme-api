import { Request } from 'express';
import { Frequency, ActivityStatus } from '@prisma/client';

// User types
export interface User {
  id: string;
  email: string;
  name?: string | null;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Activity types
export interface Activity {
  id: string;
  title: string;
  description?: string | null;
  frequency: Frequency;
  startDate?: Date | null;
  endDate?: Date | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityWithRolloverInfo extends Activity {
  isRollover: boolean;
  rolloverReason?: string;
}

export interface CreateActivityRequest {
  title: string;
  description?: string;
  frequency?: Frequency;
  startDate?: string;
  endDate?: string;
}

export interface UpdateActivityRequest {
  title?: string;
  description?: string;
  frequency?: Frequency;
  startDate?: string;
  endDate?: string;
}

// ActivityLog types
export interface ActivityLog {
  id: string;
  activityId: string;
  startDate: Date;
  endDate: Date;
  status: ActivityStatus;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  activity?: Activity;
  comments?: ActivityLogComment[];
}

export interface CreateActivityLogRequest {
  activityId: string;
  startDate: string;
  endDate: string;
  status?: ActivityStatus;
}

export interface UpdateActivityLogRequest {
  status?: ActivityStatus;
}

// ActivityLogComment types
export interface ActivityLogComment {
  id: string;
  activityLogId: string;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateActivityLogCommentRequest {
  comment: string;
}

// Request with user - Generic version that accepts all Request parameters
export interface AuthenticatedRequest<T = any, U = any, V = any> extends Request<T, any, U, V> {
  user?: User;
}

// Alternative: Using utility types for more flexibility
export type AuthenticatedRequestWithBody<T = any> = Request<any, any, T> & {
  user?: User;
};

export type AuthenticatedRequestWithParams<T = any> = Request<T, any, any> & {
  user?: User;
};

export type AuthenticatedRequestWithQuery<T = any> = Request<any, any, any, T> & {
  user?: User;
};

// Most flexible: Generic interface that can handle all Request parameters
export interface AuthenticatedRequestGeneric<
  TParams = any,
  TResBody = any,
  TReqBody = any,
  TReqQuery = any
> extends Request<TParams, TResBody, TReqBody, TReqQuery> {
  user?: User;
}

// Usage examples:
// 
// 1. Basic usage (backward compatible):
// AuthenticatedRequest req; // Same as before
//
// 2. With typed body:
// AuthenticatedRequest<{}, {}, CreateActivityRequest> req;
// req.body.title; // TypeScript knows this is a string
//
// 3. With typed params:
// AuthenticatedRequest<{id: string}> req;
// req.params.id; // TypeScript knows this is a string
//
// 4. With typed query:
// AuthenticatedRequest<{}, {}, {}, {page: string, limit: string}> req;
// req.query.page; // TypeScript knows this is a string
//
// 5. Using utility types:
// AuthenticatedRequestWithBody<CreateActivityRequest> req;
// AuthenticatedRequestWithParams<{id: string}> req;
// AuthenticatedRequestWithQuery<{page: string}> req;
//
// 6. Most flexible - all parameters typed:
// AuthenticatedRequestGeneric<
//   {id: string},           // params
//   any,                    // response body
//   CreateActivityRequest,  // request body
//   {page: string}          // query
// > req;

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Activity display types for different frequencies
export interface DailyActivity extends Activity {
  shouldAppearToday: boolean;
}

export interface WeeklyActivity extends Activity {
  shouldAppearThisWeek: boolean;
  weekStartDate: Date;
}

export interface MonthlyActivity extends Activity {
  shouldAppearThisMonth: boolean;
  monthStartDate: Date;
}

// Rollover response types
export interface RolloverSummary {
  totalRollover: number;
  dailyRollover: number;
  weeklyRollover: number;
  monthlyRollover: number;
  rolloverActivities: ActivityWithRolloverInfo[];
}

export interface ActivitiesWithRolloverResponse {
  activities: ActivityWithRolloverInfo[];
  rolloverSummary: RolloverSummary;
}

// Job types for pg-boss
export interface ActivityLogJobData {
  activityId: string;
  userId: string;
  frequency: Frequency;
  startDate: string;
  endDate: string;
}

export { Frequency, ActivityStatus };

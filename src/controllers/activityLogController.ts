import { Response, NextFunction } from 'express';
import { prisma } from '@/config/database';
import { createError } from '@/middleware/errorHandler';
import {
  AuthenticatedRequest,
  ApiResponse,
  ActivityLog,
  ActivityLogComment,
} from '@/types';
import { ActivityScheduler } from '@/workers/activityScheduler';
import logger from '@/config/logger';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with timezone support
dayjs.extend(utc);
dayjs.extend(timezone);

export const getActivityLogs = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<ActivityLog[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    const activityId = req.query['activityId'] as string;
    const status = req.query['status'] as string;
    const startDate = req.query['startDate'] as string;
    const endDate = req.query['endDate'] as string;
    const includeComments = req.query['comments'] === 'true';

    // Build where clause
    const where: any = {
      userId: req.user.id,
    };

    if (activityId) {
      where.activityId = activityId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate) {
      where.startDate = {
        gte: dayjs(startDate).toDate(),
      };
    }

    if (endDate) {
      where.endDate = {
        lte: dayjs(endDate).toDate(),
      };
    }

    const activityLogs = await prisma.activityLog.findMany({
      where,
      include: {
        activity: true,
        comments: includeComments,
      },
      orderBy: { startDate: 'desc' },
    });

    res.json({
      success: true,
      message: 'Activity logs retrieved successfully',
      data: activityLogs,
    });
  } catch (error) {
    next(error);
  }
};

export const getActivityLog = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<ActivityLog>>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    const { id } = req.params;

    const activityLog = await prisma.activityLog.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        activity: true,
        comments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!activityLog) {
      throw createError('Activity log not found', 404);
    }

    res.json({
      success: true,
      message: 'Activity log retrieved successfully',
      data: activityLog,
    });
  } catch (error) {
    next(error);
  }
};

export const updateActivityLogStatus = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<ActivityLog>>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    const { id } = req.params;
    const { status } = req.body;

    // Prepare update data
    const updateData: any = { status };

    // Set completedAt when status is changed to DONE
    if (status === 'DONE') {
      updateData.completedAt = dayjs().toDate();
    }

    logger.info(`Updating activity log status to ${status} for user: ${req.user.id}`);
    logger.info(`Update data: ${JSON.stringify(updateData)}`);

    const activityLog = await prisma.activityLog.updateMany({
      where: {
        id,
        userId: req.user.id,
      },
      data: updateData,
    });

    if (activityLog.count === 0) {
      throw createError('Activity log not found', 404);
    }

    const updatedActivityLog = await prisma.activityLog.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        activity: true,
        comments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    res.json({
      success: true,
      message: 'Activity log status updated successfully',
      data: updatedActivityLog!,
    });
  } catch (error) {
    next(error);
  }
};

export const addActivityLogComment = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<ActivityLogComment>>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    const { id } = req.params;
    const { comment } = req.body;

    // Verify the activity log exists and belongs to the user
    const activityLog = await prisma.activityLog.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!activityLog) {
      throw createError('Activity log not found', 404);
    }

    const newComment = await prisma.activityLogComment.create({
      data: {
        activityLogId: id,
        comment,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: newComment,
    });
  } catch (error) {
    next(error);
  }
};

export const getActivityLogComments = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<ActivityLogComment[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    const { id } = req.params;

    // Verify the activity log exists and belongs to the user
    const activityLog = await prisma.activityLog.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!activityLog) {
      throw createError('Activity log not found', 404);
    }

    const comments = await prisma.activityLogComment.findMany({
      where: {
        activityLogId: id,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      message: 'Comments retrieved successfully',
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteActivityLogComment = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<null>>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    const { id, commentId } = req.params;

    // Verify the activity log exists and belongs to the user
    const activityLog = await prisma.activityLog.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!activityLog) {
      throw createError('Activity log not found', 404);
    }

    const comment = await prisma.activityLogComment.deleteMany({
      where: {
        id: commentId,
        activityLogId: id,
      },
    });

    if (comment.count === 0) {
      throw createError('Comment not found', 404);
    }

    res.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const generateTodayActivityLogs = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<{ created: number; skipped: number; frequencies: string[] }>>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    logger.info(`Manual activity log generation requested by user: ${req.user.id}`);

    const today = dayjs().startOf('day').toDate();
    const tomorrow = dayjs().add(1, 'day').startOf('day').toDate();

    // Check if logs already exist for today
    const existingLogs = await prisma.activityLog.findFirst({
      where: {
        userId: req.user.id,
        startDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
    if (existingLogs) {
      res.status(409).json({
        success: false,
        message: 'Tasks for today have already been generated.',
      } as any);
      return;
    }

    // Use the same logic as generateLogsForDate for consistency
    const result = await generateLogsForDate(today, req.user.id);

    res.json({
      success: true,
      message: `Activity logs for today generated successfully for: ${result.frequencies.join(', ')}`,
      data: {
        created: result.created,
        skipped: result.skipped,
        frequencies: result.frequencies,
      },
    });
  } catch (error) {
    logger.error('Error generating today activity logs:', error);
    next(error);
  }
};

export const generateActivityLogs = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<{ created: number; skipped: number; date: string; frequencies: string[] }>>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    // Fallback to single date generation (existing behavior)
    const { date } = req.body;
    const targetDate = date ? dayjs(date).startOf('day').toDate() : dayjs().startOf('day').toDate();

    logger.info(`Manual activity log generation requested by user: ${req.user.id} for date: ${targetDate.toISOString()}`);

    const result = await generateLogsForDate(targetDate, req.user.id);

    res.json({
      success: true,
      message: `Activity logs generated successfully for: ${result.frequencies.join(', ')}`,
      data: {
        created: result.created,
        skipped: result.skipped,
        date: dayjs(targetDate).format('YYYY-MM-DD'),
        frequencies: result.frequencies,
      },
    });

  } catch (error) {
    logger.error('Error generating activity logs:', error);
    next(error);
  }
};

// Helper function to generate logs for a specific date
const generateLogsForDate = async (targetDate: Date, userId: string) => {
  let created = 0;
  let skipped = 0;
  const frequencies: string[] = [];

  // Get user's excluded intervals
  const excludedIntervals = await getUserExcludedIntervals(userId);

  // Check if daily logs should be generated
  const dayOfWeek = dayjs(targetDate).day();
  if (!shouldSkipGeneration('DAILY', targetDate, excludedIntervals)) {
    await ActivityScheduler.createDailyActivityLogs(targetDate);
    frequencies.push('daily');
  } else {
    logger.info(`Skipping daily log generation for day of week: ${dayOfWeek}`);
  }

  // Generate weekly logs if it's Sunday (day 0) and not excluded
  if (dayOfWeek === 0 && !shouldSkipGeneration('WEEKLY', targetDate, excludedIntervals)) {
    await ActivityScheduler.createWeeklyActivityLogs(targetDate);
    frequencies.push('weekly');
  } else if (dayOfWeek === 0 && shouldSkipGeneration('WEEKLY', targetDate, excludedIntervals)) {
    const weekNumber = getWeekNumber(targetDate);
    logger.info(`Skipping weekly log generation for week: ${weekNumber}`);
  }

  // Check if monthly logs should be generated
  const month = dayjs(targetDate).month() + 1; // dayjs month() returns 0-11, so add 1
  const dayOfMonth = dayjs(targetDate).date();
  if (dayOfMonth === 1 && !shouldSkipGeneration('MONTHLY', targetDate, excludedIntervals)) {
    await ActivityScheduler.createMonthlyActivityLogs(targetDate);
    frequencies.push('monthly');
  } else if (dayOfMonth === 1 && shouldSkipGeneration('MONTHLY', targetDate, excludedIntervals)) {
    logger.info(`Skipping monthly log generation for month: ${month}`);
  }

  // Count logs created for the target date
  const nextDay = dayjs(targetDate).add(1, 'day').toDate();

  const logs = await prisma.activityLog.findMany({
    where: {
      userId,
      startDate: {
        gte: targetDate,
        lt: nextDay,
      },
    },
  });

  created = logs.length;

  return { created, skipped, frequencies };
};

// Helper function to get excluded intervals for a user
const getUserExcludedIntervals = async (userId: string) => {
  const excludedIntervals = await prisma.excludedInterval.findMany({
    where: { userId },
  });

  const dailyExcludedDays = excludedIntervals
    .filter((ei: any) => ei.frequency === 'DAILY' && ei.type === 'DAY_OF_WEEK')
    .map((ei: any) => ei.value);

  const weeklyExcludedWeeks = excludedIntervals
    .filter((ei: any) => ei.frequency === 'WEEKLY' && ei.type === 'WEEK_OF_YEAR')
    .map((ei: any) => ei.value);

  const monthlyExcludedMonths = excludedIntervals
    .filter((ei: any) => ei.frequency === 'MONTHLY' && ei.type === 'MONTH')
    .map((ei: any) => ei.value);

  return {
    dailyExcludedDays,
    weeklyExcludedWeeks,
    monthlyExcludedMonths,
  };
};

// Helper function to check if generation should be skipped
const shouldSkipGeneration = (
  frequency: string,
  date: Date,
  excludedIntervals: { dailyExcludedDays: number[]; weeklyExcludedWeeks: number[]; monthlyExcludedMonths: number[] }
): boolean => {
  if (frequency === 'DAILY') {
    const dayOfWeek = date.getDay();
    return excludedIntervals.dailyExcludedDays.includes(dayOfWeek);
  }

  if (frequency === 'WEEKLY') {
    // Get the week number (1-52) for the given date
    const weekNumber = getWeekNumber(date);
    return excludedIntervals.weeklyExcludedWeeks.includes(weekNumber);
  }

  if (frequency === 'MONTHLY') {
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    return excludedIntervals.monthlyExcludedMonths.includes(month);
  }

  return false;
};

// Helper function to get week number (1-52)
const getWeekNumber = (date: Date): number => {
  return dayjs(date).week();
};

export const getExcludedIntervals = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<any>>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    const excludedIntervals = await prisma.excludedInterval.findMany({
      where: { userId: req.user.id },
      orderBy: [{ frequency: 'asc' }, { type: 'asc' }, { value: 'asc' }],
    });

    res.json({
      success: true,
      message: 'Excluded intervals retrieved successfully',
      data: excludedIntervals,
    });
  } catch (error) {
    next(error);
  }
};

export const addExcludedInterval = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<any>>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    const { frequency, type, value } = req.body;

    // Validate the value based on type
    if (type === 'DAY_OF_WEEK' && (value < 0 || value > 6)) {
      throw createError('Day of week must be between 0 (Sunday) and 6 (Saturday)', 400);
    }

    if (type === 'WEEK_OF_YEAR' && (value < 1 || value > 52)) {
      throw createError('Week of year must be between 1 and 52', 400);
    }

    if (type === 'MONTH' && (value < 1 || value > 12)) {
      throw createError('Month must be between 1 and 12', 400);
    }

    const excludedInterval = await prisma.excludedInterval.create({
      data: {
        userId: req.user.id,
        frequency,
        type,
        value,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Excluded interval added successfully',
      data: excludedInterval,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      next(createError('This excluded interval already exists', 409));
    } else {
      next(error);
    }
  }
};

export const deleteExcludedInterval = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<null>>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    const { id } = req.params;

    const result = await prisma.excludedInterval.deleteMany({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (result.count === 0) {
      throw createError('Excluded interval not found', 404);
    }

    res.json({
      success: true,
      message: 'Excluded interval deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingActivityLogs = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<ActivityLog[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    const activityId = req.query['activityId'] as string;
    const startDate = req.query['startDate'] as string;
    const endDate = req.query['endDate'] as string;
    const includeComments = req.query['comments'] === 'true';

    // Build where clause - exclude DONE status
    const where: any = {
      userId: req.user.id,
      status: {
        not: 'DONE',
      },
    };

    if (activityId) {
      where.activityId = activityId;
    }

    if (startDate) {
      where.startDate = {
        gte: dayjs(startDate).toDate(),
      };
    }

    if (endDate) {
      where.endDate = {
        lte: dayjs(endDate).toDate(),
      };
    }

    const pendingActivityLogs = await prisma.activityLog.findMany({
      where,
      include: {
        activity: true,
        comments: includeComments,
      },
      orderBy: { startDate: 'desc' },
    });

    res.json({
      success: true,
      message: 'Pending activity logs retrieved successfully',
      data: pendingActivityLogs,
    });
  } catch (error) {
    next(error);
  }
};

export const createActivityLog = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<ActivityLog>>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }
    const { activityId, startDate, endDate, status } = req.body;
    const activity = await prisma.activity.findUnique({ where: { id: activityId } });
    if (!activity) {
      throw createError('Parent activity not found', 404);
    }
    const activityLog = await prisma.activityLog.create({
      data: {
        activityId,
        userId: req.user.id,
        startDate: dayjs(startDate).toDate(),
        endDate: dayjs(endDate).toDate(),
        status: status ?? 'TODO',
        duration: activity.duration ?? null,
      },
    });
    res.status(201).json({
      success: true,
      message: 'Activity log created successfully',
      data: activityLog,
    });
  } catch (error) {
    next(error);
  }
};

export const getTodayActivityLogs = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<ActivityLog[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }

    const activityId = req.query['activityId'] as string;
    const includeComments = req.query['comments'] === 'true';

    // Get today's midnight (start of today) using dayjs for consistent timezone
    const today = dayjs().startOf('day').toDate();

    // Build where clause - tasks with endDate >= today OR overdue tasks (endDate < today but status != DONE) OR completed today
    const where: any = {
      userId: req.user.id,
      OR: [
        {
          endDate: {
            gte: today,
          },
        },
        {
          status: {
            not: 'DONE',
          },
        },
        {
          completedAt: {
            gte: today,
          },
        },
      ],
    };

    if (activityId) {
      where.activityId = activityId;
    }

    const todayActivityLogs = await prisma.activityLog.findMany({
      where,
      include: {
        activity: true,
        comments: includeComments,
      },
      orderBy: { endDate: 'asc' }, // Sort by endDate ascending to show earliest deadlines first
    });

    res.json({
      success: true,
      message: 'Today\'s activity logs retrieved successfully',
      data: todayActivityLogs,
    });
  } catch (error) {
    next(error);
  }
};

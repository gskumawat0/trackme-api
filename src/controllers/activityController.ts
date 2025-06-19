import { Response, NextFunction } from 'express';
import { prisma } from '@/config/database';
import { createError } from '@/middleware/errorHandler';
import {
  AuthenticatedRequest,
  ApiResponse,
  Activity,
} from '@/types';
import {
  getActivitiesByFrequency,
} from '@/utils/activityUtils';
import {
  CreateActivityRequest,
  UpdateActivityRequest,
  ActivityParamsRequest,
} from '@/validations/activity';

export const createActivity = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Activity>>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }
    const activityData = req.body as CreateActivityRequest;
    const activity = await prisma.activity.create({
      data: {
        ...activityData,
        description: activityData.description ?? null,
        startDate: activityData.startDate ?? null,
        endDate: activityData.endDate ?? null,
        userId: req.user.id,
      },
    });
    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

export const getActivities = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Activity[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }
    const frequency = req.query['frequency'] as string | undefined;
    const startDate = req.query['startDate'] as string | undefined;
    const endDate = req.query['endDate'] as string | undefined;
    const where: Record<string, unknown> = { userId: req.user.id };
    if (frequency) where['frequency'] = frequency;
    if (startDate) where['startDate'] = { gte: new Date(startDate) };
    if (endDate) where['endDate'] = { lte: new Date(endDate) };
    const activities = await prisma.activity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json({
      success: true,
      message: 'Activities retrieved successfully',
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

export const getActivitiesByFrequencyGroup = async (
  req: AuthenticatedRequest,
  res: Response<
    ApiResponse<{ daily: Activity[]; weekly: Activity[]; monthly: Activity[] }>
  >,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }
    const status = req.query['status'] as string | undefined;
    const where: Record<string, unknown> = { userId: req.user.id };
    if (status) where['status'] = status;
    const activities = await prisma.activity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    const groupedActivities = getActivitiesByFrequency(activities);
    res.json({
      success: true,
      message: 'Activities grouped by frequency retrieved successfully',
      data: groupedActivities,
    });
  } catch (error) {
    next(error);
  }
};

export const getActivity = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Activity>>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }
    const { id } = req.params as ActivityParamsRequest;
    const activity = await prisma.activity.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });
    if (!activity) {
      throw createError('Activity not found', 404);
    }
    res.json({
      success: true,
      message: 'Activity retrieved successfully',
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

export const updateActivity = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Activity>>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }
    const { id } = req.params as ActivityParamsRequest;
    const updateData = req.body as UpdateActivityRequest;
    const updatePayload: Record<string, unknown> = {};
    if ('title' in updateData) updatePayload['title'] = updateData['title'];
    if ('description' in updateData)
      updatePayload['description'] = updateData['description'] ?? null;
    if ('frequency' in updateData)
      updatePayload['frequency'] = updateData['frequency'];
    if ('startDate' in updateData)
      updatePayload['startDate'] = updateData['startDate'] ?? null;
    if ('endDate' in updateData)
      updatePayload['endDate'] = updateData['endDate'] ?? null;
    const activity = await prisma.activity.updateMany({
      where: {
        id,
        userId: req.user.id,
      },
      data: updatePayload,
    });
    if (activity.count === 0) {
      throw createError('Activity not found', 404);
    }
    const updatedActivity = await prisma.activity.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });
    res.json({
      success: true,
      message: 'Activity updated successfully',
      data: updatedActivity!,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteActivity = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<null>>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw createError('User not authenticated', 401);
    }
    const { id } = req.params as ActivityParamsRequest;
    const activity = await prisma.activity.deleteMany({
      where: {
        id,
        userId: req.user.id,
      },
    });
    if (activity.count === 0) {
      throw createError('Activity not found', 404);
    }
    res.json({
      success: true,
      message: 'Activity deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

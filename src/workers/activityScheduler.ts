import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { databaseConnection } from '@/config/database';
import { Frequency, ActivityStatus } from '@/types';
import logger from '@/config/logger';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekOfYear);

export class ActivityScheduler {
  /**
   * Create activity logs for daily activities
   */
  static async createDailyActivityLogs(targetDate?: Date | string): Promise<void> {
    try {
      const prisma = databaseConnection.getClient();
      const targetDay = targetDate ? dayjs(targetDate).startOf('day') : dayjs().startOf('day');

      // Get all daily activities that should be active on the target date
      const dailyActivities = await prisma.activity.findMany({
        where: {
          frequency: Frequency.DAILY,
          OR: [
            { startDate: null },
            { startDate: { lte: targetDay.toDate() } },
            { endDate: null },
            { endDate: { gte: targetDay.toDate() } },
          ],
        },
        include: {
          user: true,
        },
      });

      logger.info(
        `Found ${dailyActivities.length} daily activities to process for ${targetDay.format('YYYY-MM-DD')}`
      );

      for (const activity of dailyActivities) {
        const startDate = targetDay.toDate();
        const endDate = targetDay.endOf('day').toDate();

        // Check if activity log already exists for the target date
        const existingLog = await prisma.activityLog.findFirst({
          where: {
            activityId: activity.id,
            startDate: {
              gte: startDate,
              lt: dayjs(startDate).add(1, 'day').toDate(),
            },
          },
        });

        if (!existingLog) {
          await prisma.activityLog.create({
            data: {
              activityId: activity.id,
              userId: activity.userId,
              startDate,
              endDate,
              status: ActivityStatus.TODO,
              duration: activity.duration,
            },
          });

          logger.info(`Created daily activity log for: ${activity.title} on ${targetDay.format('YYYY-MM-DD')}`);
        }
      }
    } catch (error) {
      logger.error('Error creating daily activity logs:', error);
      throw error;
    }
  }

  /**
   * Create activity logs for weekly activities (on Sunday)
   */
  static async createWeeklyActivityLogs(targetDate?: Date | string): Promise<void> {
    try {
      const prisma = databaseConnection.getClient();
      const targetDay = targetDate ? dayjs(targetDate) : dayjs();

      // Only create weekly logs on Sunday (day 0) unless a specific date is provided
      if (!targetDate && targetDay.day() !== 0) {
        logger.info('Not Sunday, skipping weekly activity log creation');
        return;
      }

      const weekStart = targetDay.startOf('week');
      const weekEnd = targetDay.endOf('week');

      // Get all weekly activities that should be active this week
      const weeklyActivities = await prisma.activity.findMany({
        where: {
          frequency: Frequency.WEEKLY,
          OR: [
            { startDate: null },
            { startDate: { lte: weekStart.toDate() } },
            { endDate: null },
            { endDate: { gte: weekStart.toDate() } },
          ],
        },
        include: {
          user: true,
        },
      });

      logger.info(
        `Found ${weeklyActivities.length} weekly activities to process for week starting ${weekStart.format('YYYY-MM-DD')}`
      );

      for (const activity of weeklyActivities) {
        const startDate = weekStart.toDate();
        const endDate = weekEnd.toDate();

        // Check if activity log already exists for this week
        const existingLog = await prisma.activityLog.findFirst({
          where: {
            activityId: activity.id,
            startDate: {
              gte: startDate,
              lt: dayjs(startDate).add(1, 'week').toDate(),
            },
          },
        });

        if (!existingLog) {
          await prisma.activityLog.create({
            data: {
              activityId: activity.id,
              userId: activity.userId,
              startDate,
              endDate,
              status: ActivityStatus.TODO,
              duration: activity.duration,
            },
          });

          logger.info(`Created weekly activity log for: ${activity.title} for week starting ${weekStart.format('YYYY-MM-DD')}`);
        }
      }
    } catch (error) {
      logger.error('Error creating weekly activity logs:', error);
      throw error;
    }
  }

  /**
   * Create activity logs for monthly activities (on 1st of month)
   */
  static async createMonthlyActivityLogs(targetDate?: Date | string): Promise<void> {
    try {
      const prisma = databaseConnection.getClient();
      const targetDay = targetDate ? dayjs(targetDate) : dayjs();

      // Only create monthly logs on the 1st of the month unless a specific date is provided
      if (!targetDate && targetDay.date() !== 1) {
        logger.info('Not 1st of month, skipping monthly activity log creation');
        return;
      }

      const monthStart = targetDay.startOf('month');
      const monthEnd = targetDay.endOf('month');

      // Get all monthly activities that should be active this month
      const monthlyActivities = await prisma.activity.findMany({
        where: {
          frequency: Frequency.MONTHLY,
          OR: [
            { startDate: null },
            { startDate: { lte: monthStart.toDate() } },
            { endDate: null },
            { endDate: { gte: monthStart.toDate() } },
          ],
        },
        include: {
          user: true,
        },
      });

      logger.info(
        `Found ${monthlyActivities.length} monthly activities to process for month starting ${monthStart.format('YYYY-MM-DD')}`
      );

      for (const activity of monthlyActivities) {
        const startDate = monthStart.toDate();
        const endDate = monthEnd.toDate();

        // Check if activity log already exists for this month
        const existingLog = await prisma.activityLog.findFirst({
          where: {
            activityId: activity.id,
            startDate: {
              gte: startDate,
              lt: dayjs(startDate).add(1, 'month').toDate(),
            },
          },
        });

        if (!existingLog) {
          await prisma.activityLog.create({
            data: {
              activityId: activity.id,
              userId: activity.userId,
              startDate,
              endDate,
              status: ActivityStatus.TODO,
              duration: activity.duration,
            },
          });

          logger.info(`Created monthly activity log for: ${activity.title} for month starting ${monthStart.format('YYYY-MM-DD')}`);
        }
      }
    } catch (error) {
      logger.error('Error creating monthly activity logs:', error);
      throw error;
    }
  }

  /**
   * Main scheduler function to be called at midnight
   */
  static async runScheduler(targetDate?: Date | string): Promise<void> {
    try {
      const dateStr = targetDate ? dayjs(targetDate).format('YYYY-MM-DD') : 'today';
      logger.info(`Starting activity scheduler for ${dateStr}...`);

      await this.createDailyActivityLogs(targetDate);
      await this.createWeeklyActivityLogs(targetDate);
      await this.createMonthlyActivityLogs(targetDate);

      logger.info(`Activity scheduler completed successfully for ${dateStr}`);
    } catch (error) {
      logger.error('Activity scheduler failed:', error);
      throw error;
    }
  }
}

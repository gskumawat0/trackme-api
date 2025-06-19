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
  static async createDailyActivityLogs(): Promise<void> {
    try {
      const prisma = databaseConnection.getClient();
      const today = dayjs().startOf('day');

      // Get all daily activities that should be active today
      const dailyActivities = await prisma.activity.findMany({
        where: {
          frequency: Frequency.DAILY,
          OR: [
            { startDate: null },
            { startDate: { lte: today.toDate() } },
            { endDate: null },
            { endDate: { gte: today.toDate() } },
          ],
        },
        include: {
          user: true,
        },
      });

      logger.info(
        `Found ${dailyActivities.length} daily activities to process`
      );

      for (const activity of dailyActivities) {
        const startDate = today.toDate();
        const endDate = today.endOf('day').toDate();

        // Check if activity log already exists for today
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
            },
          });

          logger.info(`Created daily activity log for: ${activity.title}`);
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
  static async createWeeklyActivityLogs(): Promise<void> {
    try {
      const prisma = databaseConnection.getClient();
      const today = dayjs();

      // Only create weekly logs on Sunday (day 0)
      if (today.day() !== 0) {
        logger.info('Not Sunday, skipping weekly activity log creation');
        return;
      }

      const weekStart = today.startOf('week');
      const weekEnd = today.endOf('week');

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
        `Found ${weeklyActivities.length} weekly activities to process`
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
            },
          });

          logger.info(`Created weekly activity log for: ${activity.title}`);
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
  static async createMonthlyActivityLogs(): Promise<void> {
    try {
      const prisma = databaseConnection.getClient();
      const today = dayjs();

      // Only create monthly logs on the 1st of the month
      if (today.date() !== 1) {
        logger.info('Not 1st of month, skipping monthly activity log creation');
        return;
      }

      const monthStart = today.startOf('month');
      const monthEnd = today.endOf('month');

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
        `Found ${monthlyActivities.length} monthly activities to process`
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
            },
          });

          logger.info(`Created monthly activity log for: ${activity.title}`);
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
  static async runScheduler(): Promise<void> {
    try {
      logger.info('Starting activity scheduler...');

      await this.createDailyActivityLogs();
      await this.createWeeklyActivityLogs();
      await this.createMonthlyActivityLogs();

      logger.info('Activity scheduler completed successfully');
    } catch (error) {
      logger.error('Activity scheduler failed:', error);
      throw error;
    }
  }
}

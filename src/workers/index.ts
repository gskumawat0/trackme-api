import pgBoss from '@/config/pgBoss';
import { ActivityScheduler } from './activityScheduler';
import logger from '@/config/logger';

// Job names
const JOB_NAMES = {
  DAILY_SCHEDULER: 'daily-activity-scheduler',
  WEEKLY_SCHEDULER: 'weekly-activity-scheduler',
  MONTHLY_SCHEDULER: 'monthly-activity-scheduler',
  MIDNIGHT_SCHEDULER: 'midnight-activity-scheduler',
} as const;

class WorkerManager {
  private boss: typeof pgBoss;

  constructor() {
    this.boss = pgBoss;
  }

  async start(): Promise<void> {
    try {
      await this.boss.start();
      logger.info('PgBoss worker started successfully');

      // Set up job handlers
      await this.setupJobHandlers();

      await this.scheduleMidnightJob();

      logger.info('Worker manager initialized successfully');
    } catch (error) {
      logger.error('Failed to start worker manager:', error);
      throw error;
    }
  }

  private async setupJobHandlers(): Promise<void> {
    try {
      // Handle daily activity scheduling
      await this.boss.work(JOB_NAMES.DAILY_SCHEDULER, async (jobs) => {
        logger.info('Processing daily activity scheduler job');
        await ActivityScheduler.createDailyActivityLogs();
      });

      // Handle weekly activity scheduling
      await this.boss.work(JOB_NAMES.WEEKLY_SCHEDULER, async (jobs) => {
        logger.info('Processing weekly activity scheduler job');
        await ActivityScheduler.createWeeklyActivityLogs();
      });

      // Handle monthly activity scheduling
      await this.boss.work(JOB_NAMES.MONTHLY_SCHEDULER, async (jobs) => {
        logger.info('Processing monthly activity scheduler job');
        await ActivityScheduler.createMonthlyActivityLogs();
      });

      // Handle main midnight scheduler
      await this.boss.work(JOB_NAMES.MIDNIGHT_SCHEDULER, async (jobs) => {
        logger.info('Processing midnight activity scheduler job');
        await ActivityScheduler.runScheduler();
      });

      logger.info('Job handlers set up successfully');
    } catch (error) {
      logger.error('Failed to set up job handlers:', error);
      throw error;
    }
  }

  private async ensureQueueExists(queueName: string): Promise<void> {
  try {
    const existingQueue = await this.boss.getQueue(queueName);

    if (!existingQueue) {
      logger.info(`Queue '${queueName}' not found. Creating...`);
      await this.boss.createQueue(queueName);
      logger.info(`Queue '${queueName}' created successfully.`);
    } else {
      logger.info(`Queue '${queueName}' already exists.`);
    }
  } catch (error) {
    logger.error(`Failed to ensure queue '${queueName}':`, error);
    throw error;
  }
}

  private async scheduleMidnightJob(): Promise<void> {
    try {
      logger.info('Ensuring queue exists before scheduling midnight job');

      // Send a dummy job to ensure the queue exists (does not actually enqueue anything meaningful)
      await this.ensureQueueExists(JOB_NAMES.MIDNIGHT_SCHEDULER)
      await new Promise((res) => setTimeout(res, 500));
      logger.info('Queue ensured, now scheduling midnight job');
      await this.boss.schedule(JOB_NAMES.MIDNIGHT_SCHEDULER, '0 5 * * *', {});
    } catch (error) {
      logger.error('Failed to schedule midnight job:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      await this.boss.stop();
      logger.info('Worker manager stopped successfully');
    } catch (error) {
      logger.error('Failed to stop worker manager:', error);
      throw error;
    }
  }
}

// Create the worker manager instance
const workerManager = new WorkerManager();

export default workerManager;

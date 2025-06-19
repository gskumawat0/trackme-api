import { ActivityScheduler } from '@/workers/activityScheduler';
import { databaseConnection } from '@/config/database';
import logger from '@/config/logger';

async function testScheduler() {
  try {
    logger.info('Starting manual scheduler test...');

    // Ensure database connection
    await databaseConnection.connect();

    // Run the scheduler
    await ActivityScheduler.runScheduler();

    // Check what was created
    const prisma = databaseConnection.getClient();
    const activityLogs = await prisma.activityLog.findMany({
      include: {
        activity: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    logger.info(`Created ${activityLogs.length} activity logs:`);

    activityLogs.forEach(log => {
      logger.info(
        `- ${log.activity.title} (${log.activity.frequency}) - ${log.status}`
      );
      logger.info(`  Start: ${log.startDate.toISOString()}`);
      logger.info(`  End: ${log.endDate.toISOString()}`);
    });
  } catch (error) {
    logger.error('Scheduler test failed:', error);
  } finally {
    await databaseConnection.disconnect();
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testScheduler();
}

export default testScheduler;

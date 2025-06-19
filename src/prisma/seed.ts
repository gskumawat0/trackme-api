import { databaseConnection } from '@/config/database';
import { hashPassword } from '@/utils/auth';
import { Frequency } from '@/types';

const prisma = databaseConnection.getClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Ensure database connection
  await databaseConnection.connect();

  // Create a test user
  const hashedPassword = await hashPassword('password123');

  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
    },
  });

  console.log('✅ Created test user:', user.email);

  // Create some sample activities
  const activities = await Promise.all([
    prisma.activity.create({
      data: {
        title: 'Morning Exercise',
        description: '30 minutes of cardio and strength training',
        frequency: Frequency.DAILY,
        userId: user.id,
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Read 30 minutes',
        description: 'Read a book or article for personal development',
        frequency: Frequency.DAILY,
        userId: user.id,
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Weekly Planning',
        description: 'Plan tasks and goals for the upcoming week',
        frequency: Frequency.WEEKLY,
        userId: user.id,
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Clean House',
        description: 'Deep clean the house including bathrooms and kitchen',
        frequency: Frequency.WEEKLY,
        userId: user.id,
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Monthly Budget Review',
        description: 'Review and adjust monthly budget and expenses',
        frequency: Frequency.MONTHLY,
        userId: user.id,
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Backup Important Files',
        description: 'Create backup of important documents and photos',
        frequency: Frequency.MONTHLY,
        userId: user.id,
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Learn New Skill',
        description:
          'Dedicate time to learning a new programming language or tool',
        frequency: Frequency.WEEKLY,
        startDate: new Date('2024-01-01'),
        userId: user.id,
      },
    }),
    prisma.activity.create({
      data: {
        title: 'Seasonal Closet Cleanup',
        description: 'Organize and donate clothes for the new season',
        frequency: Frequency.MONTHLY,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-12-31'),
        userId: user.id,
      },
    }),
    // Add some activities that would demonstrate rollover
    prisma.activity.create({
      data: {
        title: "Yesterday's Unfinished Task",
        description:
          'This daily task was not completed yesterday and should roll over',
        frequency: Frequency.DAILY,
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        userId: user.id,
      },
    }),
    prisma.activity.create({
      data: {
        title: "Last Week's Pending Review",
        description:
          'This weekly task was in progress last week and should roll over',
        frequency: Frequency.WEEKLY,
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        userId: user.id,
      },
    }),
    prisma.activity.create({
      data: {
        title: "Last Month's Hold Item",
        description:
          'This monthly task was on hold last month and should roll over',
        frequency: Frequency.MONTHLY,
        startDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
        userId: user.id,
      },
    }),
  ]);

  console.log('✅ Created sample activities:', activities.length);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch(e => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await databaseConnection.disconnect();
  });

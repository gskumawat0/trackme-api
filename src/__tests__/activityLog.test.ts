import request from 'supertest';
import app from '@/index';
import { prisma } from '@/config/database';
import { hashPassword, generateToken } from '@/utils/auth';
import { Frequency, ActivityStatus } from '@/types';

describe('ActivityLog API', () => {
  let authToken: string;
  let testUser: any;
  let testActivity: any;
  let testActivityLog: any;

  beforeAll(async () => {
    // Create test user
    const hashedPassword = await hashPassword('testpassword123');
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
      },
    });

    // Create test activity
    testActivity = await prisma.activity.create({
      data: {
        title: 'Test Activity',
        description: 'Test activity description',
        frequency: Frequency.DAILY,
        userId: testUser.id,
      },
    });

    // Generate auth token
    authToken = generateToken(testUser);
  });

  afterAll(async () => {
    await prisma.activityLogComment.deleteMany();
    await prisma.activityLog.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up activity logs before each test
    await prisma.activityLogComment.deleteMany();
    await prisma.activityLog.deleteMany();
  });

  describe('GET /api/v1/activity-logs', () => {
    it('should get activity logs for authenticated user', async () => {
      // Create a test activity log
      const activityLog = await prisma.activityLog.create({
        data: {
          activityId: testActivity.id,
          userId: testUser.id,
          startDate: new Date(),
          endDate: new Date(),
          status: ActivityStatus.TODO,
        },
      });

      const response = await request(app)
        .get('/api/v1/activity-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(activityLog.id);
    });

    it('should filter activity logs by activity ID', async () => {
      // Create activity logs
      await prisma.activityLog.create({
        data: {
          activityId: testActivity.id,
          userId: testUser.id,
          startDate: new Date(),
          endDate: new Date(),
          status: ActivityStatus.TODO,
        },
      });

      const response = await request(app)
        .get(`/api/v1/activity-logs?activityId=${testActivity.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should filter activity logs by status', async () => {
      // Create activity logs with different statuses
      await prisma.activityLog.create({
        data: {
          activityId: testActivity.id,
          userId: testUser.id,
          startDate: new Date(),
          endDate: new Date(),
          status: ActivityStatus.TODO,
        },
      });

      const response = await request(app)
        .get('/api/v1/activity-logs?status=TODO')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe(ActivityStatus.TODO);
    });

    it('should return 401 for unauthenticated requests', async () => {
      await request(app).get('/api/v1/activity-logs').expect(401);
    });
  });

  describe('GET /api/v1/activity-logs/:id', () => {
    it('should get a specific activity log', async () => {
      const activityLog = await prisma.activityLog.create({
        data: {
          activityId: testActivity.id,
          userId: testUser.id,
          startDate: new Date(),
          endDate: new Date(),
          status: ActivityStatus.TODO,
        },
      });

      const response = await request(app)
        .get(`/api/v1/activity-logs/${activityLog.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(activityLog.id);
      expect(response.body.data.activity).toBeDefined();
    });

    it('should return 404 for non-existent activity log', async () => {
      await request(app)
        .get('/api/v1/activity-logs/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /api/v1/activity-logs/:id/status', () => {
    it('should update activity log status', async () => {
      const activityLog = await prisma.activityLog.create({
        data: {
          activityId: testActivity.id,
          userId: testUser.id,
          startDate: new Date(),
          endDate: new Date(),
          status: ActivityStatus.TODO,
        },
      });

      const response = await request(app)
        .patch(`/api/v1/activity-logs/${activityLog.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: ActivityStatus.IN_PROGRESS })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(ActivityStatus.IN_PROGRESS);
    });

    it('should return 400 for invalid status', async () => {
      const activityLog = await prisma.activityLog.create({
        data: {
          activityId: testActivity.id,
          userId: testUser.id,
          startDate: new Date(),
          endDate: new Date(),
          status: ActivityStatus.TODO,
        },
      });

      await request(app)
        .patch(`/api/v1/activity-logs/${activityLog.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });
  });

  describe('POST /api/v1/activity-logs/:id/comments', () => {
    it('should add a comment to activity log', async () => {
      const activityLog = await prisma.activityLog.create({
        data: {
          activityId: testActivity.id,
          userId: testUser.id,
          startDate: new Date(),
          endDate: new Date(),
          status: ActivityStatus.TODO,
        },
      });

      const response = await request(app)
        .post(`/api/v1/activity-logs/${activityLog.id}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ comment: 'Test comment' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.comment).toBe('Test comment');
    });

    it('should return 400 for empty comment', async () => {
      const activityLog = await prisma.activityLog.create({
        data: {
          activityId: testActivity.id,
          userId: testUser.id,
          startDate: new Date(),
          endDate: new Date(),
          status: ActivityStatus.TODO,
        },
      });

      await request(app)
        .post(`/api/v1/activity-logs/${activityLog.id}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ comment: '' })
        .expect(400);
    });
  });

  describe('GET /api/v1/activity-logs/:id/comments', () => {
    it('should get comments for activity log', async () => {
      const activityLog = await prisma.activityLog.create({
        data: {
          activityId: testActivity.id,
          userId: testUser.id,
          startDate: new Date(),
          endDate: new Date(),
          status: ActivityStatus.TODO,
        },
      });

      // Add comments
      await prisma.activityLogComment.createMany({
        data: [
          { activityLogId: activityLog.id, comment: 'Comment 1' },
          { activityLogId: activityLog.id, comment: 'Comment 2' },
        ],
      });

      const response = await request(app)
        .get(`/api/v1/activity-logs/${activityLog.id}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('DELETE /api/v1/activity-logs/:id/comments/:commentId', () => {
    it('should delete a comment', async () => {
      const activityLog = await prisma.activityLog.create({
        data: {
          activityId: testActivity.id,
          userId: testUser.id,
          startDate: new Date(),
          endDate: new Date(),
          status: ActivityStatus.TODO,
        },
      });

      const comment = await prisma.activityLogComment.create({
        data: {
          activityLogId: activityLog.id,
          comment: 'Test comment',
        },
      });

      const response = await request(app)
        .delete(
          `/api/v1/activity-logs/${activityLog.id}/comments/${comment.id}`
        )
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});

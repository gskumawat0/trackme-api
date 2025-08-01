import request from 'supertest';
import app from '@/index';
import { prisma } from '@/config/database';

describe('Activity Endpoints', () => {
  let authToken: string;
  let testActivityId: string;

  beforeAll(async () => {
    // Clean up database before tests
    await prisma.activity.deleteMany();
    await prisma.user.deleteMany();

    // Create a test user and get auth token
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send(userData);

    authToken = registerResponse.body.data.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/v1/activities', () => {
    it('should create a new daily activity successfully', async () => {
      const activityData = {
        title: 'Morning Exercise',
        description: '30 minutes of cardio',
        frequency: 'DAILY',
      };

      const response = await request(app)
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send(activityData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Activity created successfully');
      expect(response.body.data.title).toBe(activityData.title);
      expect(response.body.data.frequency).toBe(activityData.frequency);

      testActivityId = response.body.data.id;
    });

    it('should create a weekly activity with start date', async () => {
      const activityData = {
        title: 'Weekly Planning',
        description: 'Plan for the week',
        frequency: 'WEEKLY',
        startDate: '2024-01-01T00:00:00.000Z',
      };

      const response = await request(app)
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send(activityData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.frequency).toBe('WEEKLY');
      expect(response.body.data.startDate).toBe(activityData.startDate);
    });

    it('should create an activity with duration and category', async () => {
      const activityData = {
        title: 'Reading Session',
        description: 'Read technical documentation',
        frequency: 'DAILY',
        duration: 60,
        category: 'Learning',
      };

      const response = await request(app)
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send(activityData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(activityData.title);
      expect(response.body.data.duration).toBe(activityData.duration);
      expect(response.body.data.category).toBe(activityData.category);
    });

    it('should return 400 for invalid duration', async () => {
      const activityData = {
        title: 'Test Activity',
        duration: -10,
      };

      const response = await request(app)
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send(activityData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid frequency', async () => {
      const activityData = {
        title: 'Test Activity',
        frequency: 'INVALID',
      };

      const response = await request(app)
        .post('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send(activityData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/activities', () => {
    it('should get all activities for the user', async () => {
      const response = await request(app)
        .get('/api/v1/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter activities by frequency', async () => {
      const response = await request(app)
        .get('/api/v1/activities?frequency=DAILY')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(
        response.body.data.every(
          (activity: any) => activity.frequency === 'DAILY'
        )
      ).toBe(true);
    });

    it('should filter activities by category', async () => {
      const response = await request(app)
        .get('/api/v1/activities?category=Learning')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(
        response.body.data.every((activity: any) => activity.category === 'Learning')
      ).toBe(true);
    });
  });

  describe('GET /api/v1/activities/categories', () => {
    it('should get all unique categories for the user', async () => {
      const response = await request(app)
        .get('/api/v1/activities/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toContain('Learning');
    });
  });

  describe('GET /api/v1/activities/grouped', () => {
    it('should get activities grouped by frequency', async () => {
      const response = await request(app)
        .get('/api/v1/activities/grouped')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('daily');
      expect(response.body.data).toHaveProperty('weekly');
      expect(response.body.data).toHaveProperty('monthly');
      expect(Array.isArray(response.body.data.daily)).toBe(true);
      expect(Array.isArray(response.body.data.weekly)).toBe(true);
      expect(Array.isArray(response.body.data.monthly)).toBe(true);
    });
  });

  describe('GET /api/v1/activities/:id', () => {
    it('should get a specific activity', async () => {
      const response = await request(app)
        .get(`/api/v1/activities/${testActivityId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testActivityId);
    });

    it('should return 404 for non-existent activity', async () => {
      const response = await request(app)
        .get('/api/v1/activities/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/activities/:id', () => {
    it('should update an activity successfully', async () => {
      const updateData = {
        title: 'Updated Morning Exercise',
        description: '45 minutes of cardio and strength training',
      };

      const response = await request(app)
        .put(`/api/v1/activities/${testActivityId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.description).toBe(updateData.description);
    });

    it('should update activity duration and category', async () => {
      const updateData = {
        duration: 90,
        category: 'Fitness',
      };

      const response = await request(app)
        .put(`/api/v1/activities/${testActivityId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.duration).toBe(updateData.duration);
      expect(response.body.data.category).toBe(updateData.category);
    });
  });

  describe('DELETE /api/v1/activities/:id', () => {
    it('should delete an activity successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/activities/${testActivityId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Activity deleted successfully');
    });

    it('should return 404 for already deleted activity', async () => {
      const response = await request(app)
        .delete(`/api/v1/activities/${testActivityId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
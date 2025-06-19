import * as yup from 'yup';
import { registerSchema, loginSchema } from '@/validations/auth';
import {
  createActivitySchema,
  updateActivitySchema,
} from '@/validations/activity';

describe('Yup Validation', () => {
  describe('Auth Validation', () => {
    it('should validate valid register data', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      };

      const result = await registerSchema.validate(validData);
      expect(result).toEqual(validData);
    });

    it('should reject invalid email', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Password123',
        name: 'Test User',
      };

      await expect(registerSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should reject weak password', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'weak',
        name: 'Test User',
      };

      await expect(registerSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should validate valid login data', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const result = await loginSchema.validate(validData);
      expect(result).toEqual(validData);
    });
  });

  describe('Activity Validation', () => {
    it('should validate valid create activity data', async () => {
      const validData = {
        title: 'Test Activity',
        description: 'Test description',
        frequency: 'DAILY',
      };

      const result = await createActivitySchema.validate(validData);
      expect(result.title).toBe('Test Activity');
      expect(result.frequency).toBe('DAILY');
    });

    it('should reject empty title', async () => {
      const invalidData = {
        title: '',
        frequency: 'DAILY',
      };

      await expect(
        createActivitySchema.validate(invalidData)
      ).rejects.toThrow();
    });

    it('should reject invalid frequency', async () => {
      const invalidData = {
        title: 'Test Activity',
        frequency: 'INVALID',
      };

      await expect(
        createActivitySchema.validate(invalidData)
      ).rejects.toThrow();
    });

    it('should validate valid update activity data', async () => {
      const validData = {
        title: 'Updated Activity',
        status: 'IN_PROGRESS',
      };

      const result = await updateActivitySchema.validate(validData);
      expect(result.title).toBe('Updated Activity');
      expect(result.status).toBe('IN_PROGRESS');
    });
  });
});

import { Router } from 'express';
import { register, login, getProfile } from '@/controllers/authController';
import { authenticateToken } from '@/middleware/auth';
import { validate } from '@/middleware/validation';
import { registerSchema, loginSchema } from '@/validations/auth';

const router = Router();

// POST /api/v1/auth/register - Register a new user
router.post('/register', validate(registerSchema), register);

// POST /api/v1/auth/login - Login user
router.post('/login', validate(loginSchema), login);

// GET /api/v1/auth/me - Get current user profile (requires authentication)
router.get('/me', authenticateToken, getProfile);

export default router;

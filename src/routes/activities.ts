import { Router } from 'express';
import {
  getActivities,
  createActivity,
  getActivity,
  updateActivity,
  deleteActivity,
} from '@/controllers/activityController';
import { authenticateToken } from '@/middleware/auth';
import {
  validate,
  validateQuery,
  validateParams,
} from '@/middleware/validation';
import {
  createActivitySchema,
  updateActivitySchema,
  activityQuerySchema,
  activityParamsSchema,
} from '@/validations/activity';

const router = Router();

// All activity routes require authentication
router.use(authenticateToken);

// GET /api/v1/activities - Get all activities (with filtering)
router.get('/', validateQuery(activityQuerySchema), getActivities);

// POST /api/v1/activities - Create a new activity
router.post('/', validate(createActivitySchema), createActivity);

// GET /api/v1/activities/:id - Get a specific activity
router.get('/:id', validateParams(activityParamsSchema), getActivity);

// PUT /api/v1/activities/:id - Update an activity
router.put(
  '/:id',
  validateParams(activityParamsSchema),
  validate(updateActivitySchema),
  updateActivity
);

// DELETE /api/v1/activities/:id - Delete an activity
router.delete('/:id', validateParams(activityParamsSchema), deleteActivity);

export default router;

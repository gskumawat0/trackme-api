import { Router } from 'express';
import {
  getActivityLogs,
  getActivityLog,
  updateActivityLogStatus,
  addActivityLogComment,
  getActivityLogComments,
  deleteActivityLogComment,
  generateTodayActivityLogs,
  generateActivityLogs,
  getExcludedIntervals,
  addExcludedInterval,
  deleteExcludedInterval,
  getPendingActivityLogs,
  createActivityLog,
} from '@/controllers/activityLogController';
import { authenticateToken } from '@/middleware/auth';
import {
  validate,
  validateQuery,
  validateParams,
} from '@/middleware/validation';
import {
  updateActivityLogStatusSchema,
  createActivityLogCommentSchema,
  activityLogQuerySchema,
  activityLogParamsSchema,
  activityLogCommentParamsSchema,
  createExcludedIntervalSchema,
  excludedIntervalParamsSchema,
  generateActivityLogsSchema,
} from '@/validations/activityLog';

const router = Router();

// All activity log routes require authentication
router.use(authenticateToken);

// POST /api/v1/activity-logs/generate-today - Manually generate activity logs for today
router.post('/generate-today', generateTodayActivityLogs);

// POST /api/v1/activity-logs/generate - Manually generate activity logs for specific date/frequency
router.post('/generate', validate(generateActivityLogsSchema), generateActivityLogs);

// GET /api/v1/activity-logs/excluded-intervals - Get user's excluded intervals
router.get('/excluded-intervals', getExcludedIntervals);

// POST /api/v1/activity-logs/excluded-intervals - Add an excluded interval
router.post('/excluded-intervals', validate(createExcludedIntervalSchema), addExcludedInterval);

// DELETE /api/v1/activity-logs/excluded-intervals/:id - Delete an excluded interval
router.delete('/excluded-intervals/:id', validateParams(excludedIntervalParamsSchema), deleteExcludedInterval);

// GET /api/v1/activity-logs - Get all activity logs with optional filtering
router.get('/', validateQuery(activityLogQuerySchema), getActivityLogs);

// GET /api/v1/activity-logs/pending - Get all pending activity logs (not DONE)
router.get('/pending', validateQuery(activityLogQuerySchema), getPendingActivityLogs);

// GET /api/v1/activity-logs/:id - Get a specific activity log
router.get('/:id', validateParams(activityLogParamsSchema), getActivityLog);

// PATCH /api/v1/activity-logs/:id/status - Update activity log status
router.patch(
  '/:id/status',
  validateParams(activityLogParamsSchema),
  validate(updateActivityLogStatusSchema),
  updateActivityLogStatus
);

// POST /api/v1/activity-logs/:id/comments - Add a comment to activity log
router.post(
  '/:id/comments',
  validateParams(activityLogParamsSchema),
  validate(createActivityLogCommentSchema),
  addActivityLogComment
);

// GET /api/v1/activity-logs/:id/comments - Get comments for activity log
router.get(
  '/:id/comments',
  validateParams(activityLogParamsSchema),
  getActivityLogComments
);

// DELETE /api/v1/activity-logs/:id/comments/:commentId - Delete a comment
router.delete(
  '/:id/comments/:commentId',
  validateParams(activityLogCommentParamsSchema),
  deleteActivityLogComment
);

// POST /api/v1/activity-logs - Create a new activity log
router.post('/', createActivityLog);

export default router;

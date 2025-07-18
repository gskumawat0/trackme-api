/**
 * @swagger
 * tags:
 *   name: Activity Logs
 *   description: Activity log management and tracking endpoints
 */

/**
 * @swagger
 * /activity-logs:
 *   get:
 *     summary: Get all activity logs
 *     tags: [Activity Logs]
 *     description: Retrieve all activity logs for the authenticated user with optional filtering
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/activityIdQuery'
 *       - $ref: '#/components/parameters/statusQuery'
 *       - $ref: '#/components/parameters/startDateQuery'
 *       - $ref: '#/components/parameters/endDateQuery'
 *       - $ref: '#/components/parameters/commentsQuery'
 *       - $ref: '#/components/parameters/pageQuery'
 *       - $ref: '#/components/parameters/limitQuery'
 *     responses:
 *       200:
 *         description: Activity logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *             example:
 *               success: true
 *               message: "Activity logs retrieved successfully"
 *               data:
 *                 - id: "123e4567-e89b-12d3-a456-426614174000"
 *                   activityId: "123e4567-e89b-12d3-a456-426614174001"
 *                   startDate: "2024-01-01T09:00:00.000Z"
 *                   endDate: "2024-01-01T09:30:00.000Z"
 *                   status: "PENDING"
 *                   duration: 30
 *                   completedAt: null
 *                   userId: "123e4567-e89b-12d3-a456-426614174002"
 *                   createdAt: "2024-01-01T00:00:00.000Z"
 *                   updatedAt: "2024-01-01T00:00:00.000Z"
 *                   activity:
 *                     id: "123e4567-e89b-12d3-a456-426614174001"
 *                     title: "Morning Exercise"
 *                     frequency: "DAILY"
 *               pagination:
 *                 page: 1
 *                 limit: 10
 *                 total: 1
 *                 totalPages: 1
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     summary: Create a new activity log
 *     tags: [Activity Logs]
 *     description: Manually create a new activity log
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['activityId', 'startDate', 'endDate']
 *             properties:
 *               activityId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the activity
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Start date and time of the activity log
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: End date and time of the activity log
 *               status:
 *                 type: string
 *                 enum: ['PENDING', 'IN_PROGRESS', 'DONE', 'SKIPPED']
 *                 default: 'PENDING'
 *                 description: Status of the activity log
 *           example:
 *             activityId: "123e4567-e89b-12d3-a456-426614174001"
 *             startDate: "2024-01-01T09:00:00.000Z"
 *             endDate: "2024-01-01T09:30:00.000Z"
 *             status: "PENDING"
 *     responses:
 *       201:
 *         description: Activity log created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Activity log created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ActivityLog'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /activity-logs/generate-today:
 *   post:
 *     summary: Generate activity logs for today
 *     tags: [Activity Logs]
 *     description: Manually generate activity logs for the current day
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Activity logs generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Activity logs generated successfully for today"
 *                 data:
 *                   type: object
 *                   properties:
 *                     generated:
 *                       type: integer
 *                       description: Number of activity logs generated
 *                       example: 5
 *                     logs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ActivityLog'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /activity-logs/generate:
 *   post:
 *     summary: Generate activity logs for specific date range
 *     tags: [Activity Logs]
 *     description: Manually generate activity logs for a specific date or date range
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GenerateActivityLogsRequest'
 *           example:
 *             startDate: "2024-01-01"
 *             endDate: "2024-01-07"
 *             frequency: "DAILY"
 *     responses:
 *       200:
 *         description: Activity logs generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Activity logs generated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     generated:
 *                       type: integer
 *                       description: Number of activity logs generated
 *                       example: 35
 *                     logs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ActivityLog'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /activity-logs/pending:
 *   get:
 *     summary: Get pending activity logs
 *     tags: [Activity Logs]
 *     description: Retrieve all pending activity logs (not DONE) for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/activityIdQuery'
 *       - $ref: '#/components/parameters/startDateQuery'
 *       - $ref: '#/components/parameters/endDateQuery'
 *       - $ref: '#/components/parameters/commentsQuery'
 *       - $ref: '#/components/parameters/pageQuery'
 *       - $ref: '#/components/parameters/limitQuery'
 *     responses:
 *       200:
 *         description: Pending activity logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /activity-logs/today:
 *   get:
 *     summary: Get today's activity logs
 *     tags: [Activity Logs]
 *     description: Retrieve all activity logs with endDate >= today
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/activityIdQuery'
 *       - $ref: '#/components/parameters/commentsQuery'
 *     responses:
 *       200:
 *         description: Today's activity logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Today's activity logs retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ActivityLog'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /activity-logs/{id}:
 *   get:
 *     summary: Get a specific activity log
 *     tags: [Activity Logs]
 *     description: Retrieve a specific activity log by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/activityLogIdParam'
 *     responses:
 *       200:
 *         description: Activity log retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Activity log retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ActivityLog'
 *       400:
 *         description: Invalid activity log ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Activity log not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /activity-logs/{id}/status:
 *   patch:
 *     summary: Update activity log status
 *     tags: [Activity Logs]
 *     description: Update the status of a specific activity log
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/activityLogIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateActivityLogStatusRequest'
 *           example:
 *             status: "DONE"
 *     responses:
 *       200:
 *         description: Activity log status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Activity log status updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ActivityLog'
 *       400:
 *         description: Validation error or invalid activity log ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Activity log not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /activity-logs/{id}/comments:
 *   get:
 *     summary: Get comments for activity log
 *     tags: [Activity Logs]
 *     description: Retrieve all comments for a specific activity log
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/activityLogIdParam'
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Comments retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ActivityLogComment'
 *       400:
 *         description: Invalid activity log ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Activity log not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     summary: Add comment to activity log
 *     tags: [Activity Logs]
 *     description: Add a new comment to a specific activity log
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/activityLogIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateActivityLogCommentRequest'
 *           example:
 *             comment: "Completed the workout successfully!"
 *     responses:
 *       201:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Comment added successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ActivityLogComment'
 *       400:
 *         description: Validation error or invalid activity log ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Activity log not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /activity-logs/{id}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Activity Logs]
 *     description: Delete a specific comment from an activity log
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/activityLogIdParam'
 *       - $ref: '#/components/parameters/commentIdParam'
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Comment deleted successfully"
 *       400:
 *         description: Invalid activity log ID or comment ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Activity log or comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /activity-logs/excluded-intervals:
 *   get:
 *     summary: Get excluded intervals
 *     tags: [Activity Logs]
 *     description: Retrieve all excluded intervals for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Excluded intervals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Excluded intervals retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       frequency:
 *                         type: string
 *                         enum: ['DAILY', 'WEEKLY', 'MONTHLY']
 *                       type:
 *                         type: string
 *                         enum: ['DAY_OF_WEEK', 'WEEK_OF_YEAR', 'MONTH']
 *                       value:
 *                         type: integer
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     summary: Add excluded interval
 *     tags: [Activity Logs]
 *     description: Add a new excluded interval for activity log generation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExcludedIntervalRequest'
 *           example:
 *             frequency: "WEEKLY"
 *             type: "DAY_OF_WEEK"
 *             value: 0
 *     responses:
 *       201:
 *         description: Excluded interval added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Excluded interval added successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     frequency:
 *                       type: string
 *                     type:
 *                       type: string
 *                     value:
 *                       type: integer
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /activity-logs/excluded-intervals/{id}:
 *   delete:
 *     summary: Delete excluded interval
 *     tags: [Activity Logs]
 *     description: Delete a specific excluded interval
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/excludedIntervalIdParam'
 *     responses:
 *       200:
 *         description: Excluded interval deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Excluded interval deleted successfully"
 *       400:
 *         description: Invalid excluded interval ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Excluded interval not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */ 
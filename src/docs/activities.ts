/**
 * @swagger
 * tags:
 *   name: Activities
 *   description: Activity management endpoints
 */

/**
 * @swagger
 * /activities:
 *   get:
 *     summary: Get all activities
 *     tags: [Activities]
 *     description: Retrieve all activities for the authenticated user with optional filtering
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/frequencyQuery'
 *       - $ref: '#/components/parameters/categoryQuery'
 *       - $ref: '#/components/parameters/includeRolloverQuery'
 *       - $ref: '#/components/parameters/startDateQuery'
 *       - $ref: '#/components/parameters/endDateQuery'
 *       - $ref: '#/components/parameters/pageQuery'
 *       - $ref: '#/components/parameters/limitQuery'
 *     responses:
 *       200:
 *         description: Activities retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *             example:
 *               success: true
 *               message: "Activities retrieved successfully"
 *               data:
 *                 - id: "123e4567-e89b-12d3-a456-426614174000"
 *                   title: "Morning Exercise"
 *                   description: "Daily morning workout routine"
 *                   frequency: "DAILY"
 *                   duration: 30
 *                   category: "Fitness"
 *                   startDate: "2024-01-01T00:00:00.000Z"
 *                   endDate: null
 *                   userId: "123e4567-e89b-12d3-a456-426614174001"
 *                   createdAt: "2024-01-01T00:00:00.000Z"
 *                   updatedAt: "2024-01-01T00:00:00.000Z"
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
 *     summary: Create a new activity
 *     tags: [Activities]
 *     description: Create a new activity for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateActivityRequest'
 *           example:
 *             title: "Morning Exercise"
 *             description: "Daily morning workout routine"
 *             frequency: "DAILY"
 *             duration: 30
 *             category: "Fitness"
 *             startDate: "2024-01-01T00:00:00.000Z"
 *     responses:
 *       201:
 *         description: Activity created successfully
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
 *                   example: "Activity created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Activity'
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
 * /activities/categories:
 *   get:
 *     summary: Get all unique categories
 *     tags: [Activities]
 *     description: Retrieve all unique activity categories for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
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
 *                   example: "Categories retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Fitness", "Work", "Personal", "Health"]
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /activities/grouped:
 *   get:
 *     summary: Get activities grouped by frequency
 *     tags: [Activities]
 *     description: Retrieve activities grouped by their frequency (daily, weekly, monthly)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Grouped activities retrieved successfully
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
 *                   example: "Grouped activities retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     DAILY:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Activity'
 *                     WEEKLY:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Activity'
 *                     MONTHLY:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Activity'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /activities/{id}:
 *   get:
 *     summary: Get a specific activity
 *     tags: [Activities]
 *     description: Retrieve a specific activity by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/activityIdParam'
 *     responses:
 *       200:
 *         description: Activity retrieved successfully
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
 *                   example: "Activity retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Activity'
 *       400:
 *         description: Invalid activity ID
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
 *         description: Activity not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     summary: Update an activity
 *     tags: [Activities]
 *     description: Update an existing activity by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/activityIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateActivityRequest'
 *           example:
 *             title: "Updated Morning Exercise"
 *             description: "Updated daily morning workout routine"
 *             duration: 45
 *     responses:
 *       200:
 *         description: Activity updated successfully
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
 *                   example: "Activity updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Activity'
 *       400:
 *         description: Validation error or invalid activity ID
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
 *         description: Activity not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Delete an activity
 *     tags: [Activities]
 *     description: Delete an activity by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/activityIdParam'
 *     responses:
 *       200:
 *         description: Activity deleted successfully
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
 *                   example: "Activity deleted successfully"
 *       400:
 *         description: Invalid activity ID
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
 *         description: Activity not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */ 
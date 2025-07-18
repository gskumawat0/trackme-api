/**
 * @swagger
 * tags:
 *   name: Health
 *   description: API health and status monitoring endpoints
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     description: Check the health status of the API server and its dependencies
 *     responses:
 *       200:
 *         description: Server is healthy
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
 *                   example: "Server is running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T12:00:00.000Z"
 *                 database:
 *                   type: string
 *                   enum: ['connected', 'disconnected']
 *                   example: "connected"
 *                   description: Database connection status
 *                 worker:
 *                   type: string
 *                   example: "running"
 *                   description: Background worker status
 *             example:
 *               success: true
 *               message: "Server is running"
 *               timestamp: "2024-01-01T12:00:00.000Z"
 *               database: "connected"
 *               worker: "running"
 *       503:
 *         description: Server is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server is unhealthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 database:
 *                   type: string
 *                   enum: ['connected', 'disconnected']
 *                 worker:
 *                   type: string
 *             example:
 *               success: false
 *               message: "Server is unhealthy"
 *               timestamp: "2024-01-01T12:00:00.000Z"
 *               database: "disconnected"
 *               worker: "stopped"
 */ 
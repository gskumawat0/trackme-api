import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import morganMiddleware from '@/middleware/morgan';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';
import authRoutes from '@/routes/auth';
import activityRoutes from '@/routes/activities';
import activityLogRoutes from '@/routes/activityLogs';
import logger from '@/config/logger';
import { databaseConnection } from '@/config/database';
import workerManager from '@/workers';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3000;
const API_PREFIX = process.env['API_PREFIX'] || '/api/v1';

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morganMiddleware);

// Health check endpoint
app.get('/health', (_, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: databaseConnection.isDatabaseConnected() ? 'connected' : 'disconnected',
    worker: 'running', // Worker is now part of the main process
  });
});

// API routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/activities`, activityRoutes);
app.use(`${API_PREFIX}/activity-logs`, activityLogRoutes);

// Swagger documentation (simple setup)
const swaggerUi = require('swagger-ui-express');
const { specs } = require('./config/swagger');
app.use(`${API_PREFIX}/docs`, swaggerUi.serve);
app.get(`${API_PREFIX}/docs`, swaggerUi.setup(specs, {
  explorer: true,
  customSiteTitle: 'TrackMe API Documentation'
}));

// 404 handler
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Initialize database connection and start server
async function startServer() {
  try {
    // Connect to database
    await databaseConnection.connect();
    
    // Start the worker manager
    try {
      await workerManager.start();
      logger.info('Worker manager started successfully');
    } catch (error) {
      logger.warn('Failed to start worker manager, continuing without background jobs:', error);
    }
    
    // Start server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env['NODE_ENV']}`);
      logger.info(`API Base URL: http://localhost:${PORT}${API_PREFIX}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Start the server
startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await workerManager.stop();
  await databaseConnection.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await workerManager.stop();
  await databaseConnection.disconnect();
  process.exit(0);
});

export default app;
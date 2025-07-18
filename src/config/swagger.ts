import swaggerJsdoc from 'swagger-jsdoc';
import { Frequency, ActivityStatus } from '@prisma/client';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TrackMe API',
      version: '1.0.0',
      description: 'A comprehensive API for tracking activities and managing activity logs with scheduling capabilities.',
      contact: {
        name: 'TrackMe API Support',
        email: 'support@trackme.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
      {
        url: 'https://trackcity.onrender.com/api/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from login endpoint',
        },
      },
      schemas: {
        // Common response schemas
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the request was successful',
            },
            message: {
              type: 'string',
              description: 'Response message',
            },
            data: {
              description: 'Response data (varies by endpoint)',
            },
            error: {
              type: 'string',
              description: 'Error message (if any)',
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            message: {
              type: 'string',
            },
            data: {
              type: 'array',
              items: {
                description: 'Array of items',
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  description: 'Current page number',
                },
                limit: {
                  type: 'integer',
                  description: 'Number of items per page',
                },
                total: {
                  type: 'integer',
                  description: 'Total number of items',
                },
                totalPages: {
                  type: 'integer',
                  description: 'Total number of pages',
                },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
            error: {
              type: 'string',
              description: 'Detailed error information',
            },
          },
        },
        // User schemas
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            name: {
              type: 'string',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        // Activity schemas
        Activity: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            title: {
              type: 'string',
              maxLength: 200,
            },
            description: {
              type: 'string',
              maxLength: 1000,
            },
            frequency: {
              type: 'string',
              enum: Object.values(Frequency),
            },
            duration: {
              type: 'integer',
              minimum: 1,
            },
            category: {
              type: 'string',
              maxLength: 100,
            },
            startDate: {
              type: 'string',
              format: 'date-time',
            },
            endDate: {
              type: 'string',
              format: 'date-time',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        // ActivityLog schemas
        ActivityLog: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            activityId: {
              type: 'string',
              format: 'uuid',
            },
            startDate: {
              type: 'string',
              format: 'date-time',
            },
            endDate: {
              type: 'string',
              format: 'date-time',
            },
            status: {
              type: 'string',
              enum: Object.values(ActivityStatus),
            },
            duration: {
              type: 'integer',
            },
            completedAt: {
              type: 'string',
              format: 'date-time',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
            activity: {
              $ref: '#/components/schemas/Activity',
            },
            comments: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ActivityLogComment',
              },
            },
          },
        },
        ActivityLogComment: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            activityLogId: {
              type: 'string',
              format: 'uuid',
            },
            comment: {
              type: 'string',
              maxLength: 1000,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        // Request schemas
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'Password (min 8 chars, must contain uppercase, lowercase, and number)',
            },
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'User full name',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            password: {
              type: 'string',
              description: 'User password',
            },
          },
        },
        CreateActivityRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 200,
              description: 'Activity title',
            },
            description: {
              type: 'string',
              maxLength: 1000,
              description: 'Activity description',
            },
            frequency: {
              type: 'string',
              enum: Object.values(Frequency),
              default: 'DAILY',
              description: 'Activity frequency',
            },
            duration: {
              type: 'integer',
              minimum: 1,
              description: 'Activity duration in minutes',
            },
            category: {
              type: 'string',
              maxLength: 100,
              description: 'Activity category',
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Activity start date',
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              description: 'Activity end date (must be after startDate)',
            },
          },
        },
        UpdateActivityRequest: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 200,
              description: 'Activity title',
            },
            description: {
              type: 'string',
              maxLength: 1000,
              description: 'Activity description',
            },
            frequency: {
              type: 'string',
              enum: Object.values(Frequency),
              description: 'Activity frequency',
            },
            duration: {
              type: 'integer',
              minimum: 1,
              description: 'Activity duration in minutes',
            },
            category: {
              type: 'string',
              maxLength: 100,
              description: 'Activity category',
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Activity start date',
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              description: 'Activity end date (must be after startDate)',
            },
          },
        },
        UpdateActivityLogStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: Object.values(ActivityStatus),
              description: 'New status for the activity log',
            },
          },
        },
        CreateActivityLogCommentRequest: {
          type: 'object',
          required: ['comment'],
          properties: {
            comment: {
              type: 'string',
              minLength: 1,
              maxLength: 1000,
              description: 'Comment text',
            },
          },
        },
        CreateExcludedIntervalRequest: {
          type: 'object',
          required: ['frequency', 'type', 'value'],
          properties: {
            frequency: {
              type: 'string',
              enum: Object.values(Frequency),
              description: 'Frequency for the excluded interval',
            },
            type: {
              type: 'string',
              enum: ['DAY_OF_WEEK', 'WEEK_OF_YEAR', 'MONTH'],
              description: 'Type of excluded interval',
            },
            value: {
              type: 'integer',
              description: 'Value for the excluded interval (0-6 for DAY_OF_WEEK, 1-52 for WEEK_OF_YEAR, 1-12 for MONTH)',
            },
          },
        },
        GenerateActivityLogsRequest: {
          type: 'object',
          properties: {
            startDate: {
              type: 'string',
              format: 'date',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$',
              description: 'Start date in YYYY-MM-DD format',
            },
            endDate: {
              type: 'string',
              format: 'date',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$',
              description: 'End date in YYYY-MM-DD format (required if startDate is provided)',
            },
            date: {
              type: 'string',
              format: 'date',
              pattern: '^\\d{4}-\\d{2}-\\d{2}$',
              description: 'Single date in YYYY-MM-DD format',
            },
            frequency: {
              type: 'string',
              enum: Object.values(Frequency),
              description: 'Frequency filter for generating logs',
            },
          },
        },
      },
      parameters: {
        // Common parameters
        activityIdParam: {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          description: 'Activity ID',
        },
        activityLogIdParam: {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          description: 'Activity Log ID',
        },
        commentIdParam: {
          name: 'commentId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          description: 'Comment ID',
        },
        excludedIntervalIdParam: {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          description: 'Excluded Interval ID',
        },
        // Query parameters
        pageQuery: {
          name: 'page',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1,
          },
          description: 'Page number for pagination',
        },
        limitQuery: {
          name: 'limit',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10,
          },
          description: 'Number of items per page',
        },
        frequencyQuery: {
          name: 'frequency',
          in: 'query',
          schema: {
            type: 'string',
            enum: Object.values(Frequency),
          },
          description: 'Filter by frequency',
        },
        categoryQuery: {
          name: 'category',
          in: 'query',
          schema: {
            type: 'string',
            maxLength: 100,
          },
          description: 'Filter by category',
        },
        statusQuery: {
          name: 'status',
          in: 'query',
          schema: {
            type: 'string',
            enum: Object.values(ActivityStatus),
          },
          description: 'Filter by status',
        },
        startDateQuery: {
          name: 'startDate',
          in: 'query',
          schema: {
            type: 'string',
            format: 'date',
          },
          description: 'Filter by start date',
        },
        endDateQuery: {
          name: 'endDate',
          in: 'query',
          schema: {
            type: 'string',
            format: 'date',
          },
          description: 'Filter by end date',
        },
        includeRolloverQuery: {
          name: 'includeRollover',
          in: 'query',
          schema: {
            type: 'boolean',
            default: false,
          },
          description: 'Include rollover activities',
        },
        commentsQuery: {
          name: 'comments',
          in: 'query',
          schema: {
            type: 'boolean',
            default: false,
          },
          description: 'Include comments in response',
        },
        activityIdQuery: {
          name: 'activityId',
          in: 'query',
          schema: {
            type: 'string',
            format: 'uuid',
          },
          description: 'Filter by activity ID',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/docs/*.ts',
  ],
};

export const specs = swaggerJsdoc(options); 
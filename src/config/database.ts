import { PrismaClient } from '@prisma/client';
import logger from './logger';
import { databaseConfig } from './databaseConfig';

declare global {
  var prisma: PrismaClient | undefined;
}

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private prismaClient: PrismaClient | null = null;
  private isConnected: boolean = false;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public getClient(): PrismaClient {
    if (!this.prismaClient) {
      // Use DATABASE_URL if available, otherwise build from components
      const connectionString = databaseConfig.getConnectionString();
      
      
      this.prismaClient = new PrismaClient({
        log: ['error'],
        datasources: {
          db: {
            url: connectionString
          }
        }
      });

      // Store in global for development hot reload
      if (process.env['NODE_ENV'] === 'development') {
        globalThis.prisma = this.prismaClient;
      }
    }

    return this.prismaClient;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      const client = this.getClient();
      await client.$connect();
      this.isConnected = true;
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Failed to connect to database', { error });
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.prismaClient || !this.isConnected) {
      return;
    }

    try {
      await this.prismaClient.$disconnect();
      this.isConnected = false;
      this.prismaClient = null;
      logger.info('Database disconnected successfully');
    } catch (error) {
      logger.error('Failed to disconnect from database', { error });
      throw error;
    }
  }

  public isDatabaseConnected(): boolean {
    return this.isConnected;
  }
}

// Create singleton instance
const databaseConnection = DatabaseConnection.getInstance();

// Export the client getter for backward compatibility
export const prisma = databaseConnection.getClient();

// Export the database connection instance for advanced usage
export { databaseConnection };

// Export default for backward compatibility
export default prisma;

// Graceful shutdown handling
process.on('beforeExit', async () => {
  logger.info('Application shutting down, disconnecting database...');
  await databaseConnection.disconnect();
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, disconnecting database...');
  await databaseConnection.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, disconnecting database...');
  await databaseConnection.disconnect();
  process.exit(0);
});

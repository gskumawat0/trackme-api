import fs from 'fs';
import path from 'path';

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  schema?: string;
}

export interface SSLConfig {
  rejectUnauthorized: boolean;
  ca?: string;
  key?: string;
  cert?: string;
}

export class DatabaseConnectionConfig {
  private static instance: DatabaseConnectionConfig;
  private config: DatabaseConfig;
  private sslConfig: SSLConfig;

  private constructor() {
    this.config = {
      host: process.env['DB_HOST'] || 'localhost',
      port: parseInt(process.env['DB_PORT'] || '5432'),
      username: process.env['DB_USERNAME'] || 'username',
      password: process.env['DB_PASSWORD'] || 'password',
      database: process.env['DB_NAME'] || 'trackme_db',
      schema: process.env['DB_SCHEMA'] || 'public'
    };

    this.sslConfig = this.getSSLConfig();
  }

  public static getInstance(): DatabaseConnectionConfig {
    if (!DatabaseConnectionConfig.instance) {
      DatabaseConnectionConfig.instance = new DatabaseConnectionConfig();
    }
    return DatabaseConnectionConfig.instance;
  }

  private getSSLConfig(): SSLConfig {
    const caCertPath = path.join(__dirname, '../../certificates/aiven-ca.pem');
    
    try {
      // Check if CA certificate file exists
      if (fs.existsSync(caCertPath)) {
        const caCert = fs.readFileSync(caCertPath, 'utf8').toString();
        
        return {
          rejectUnauthorized: true,
          ca: caCert
        };
      } else {
        // Fallback to accepting self-signed certificates
        return {
          rejectUnauthorized: false
        };
      }
    } catch (error) {
      return {
        rejectUnauthorized: false
      };
    }
  }

  public getConnectionString(schema?: string): string {
    const { host, port, username, password, database } = this.config;
    const targetSchema = schema || this.config.schema;
    
    // For Aiven, always use sslmode=require
    return `postgresql://${username}:${password}@${host}:${port}/${database}?search_path=${targetSchema}&sslmode=verify-full`;
  }

  public getConnectionObject(schema?: string) {
    const { host, port, username, password, database } = this.config;
    const targetSchema = schema || this.config.schema;
    
    return {
      host,
      port,
      database,
      user: username,
      password,
      schema: targetSchema,
      ssl: this.sslConfig
    };
  }

  public getSSLConfiguration(): SSLConfig {
    return this.sslConfig;
  }

  public getConfig(): DatabaseConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const databaseConfig = DatabaseConnectionConfig.getInstance(); 
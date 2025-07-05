import PgBoss from 'pg-boss';
import { databaseConfig } from './databaseConfig';

const connectionConfig = databaseConfig.getConnectionObject(process.env['PG_BOSS_SCHEMA'] || 'pgboss');

const pgBoss = new PgBoss({
  host: connectionConfig.host,
  port: connectionConfig.port,
  user: connectionConfig.user,
  password: connectionConfig.password,
  database: connectionConfig.database,
  schema: connectionConfig.schema || 'pgboss',
  ssl: connectionConfig.ssl,
  max: 10,
  retryLimit: 3,
  retryDelay: 1000,
  retryBackoff: true,
  expireInHours: 23,
  maintenanceIntervalMinutes: 10
});

export default pgBoss;

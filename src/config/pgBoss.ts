import PgBoss from 'pg-boss';

const pgBoss = new PgBoss({
  connectionString: `${process.env['PG_BOSS_DATABASE_URL']}?search_path=${process.env['PG_BOSS_SCHEMA']}`,
  max: 10,
  retryLimit: 3,
  retryDelay: 1000,
  retryBackoff: true,
  expireInHours: 23,
  maintenanceIntervalMinutes: 10
});

export default pgBoss;

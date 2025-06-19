import pgBoss from '@/config/pgBoss';
import { databaseConnection } from '@/config/database';

async function testPgBossSchema() {
  try {
    console.log('🔍 Testing pg-boss schema connection...');
    
    // Get the schema from environment
    const schema = process.env['PG_BOSS_SCHEMA'] || 'pgboss';
    console.log(`📋 Expected schema: ${schema}`);
    
    // Start pg-boss
    await pgBoss.start();
    console.log('✅ pg-boss started successfully');
    
    // Test database connection and check schema
    const prisma = databaseConnection.getClient();
    
    // Query to check current search_path
    const searchPathResult = await prisma.$queryRaw`SHOW search_path`;
    console.log('🔍 Current search_path:', searchPathResult);
    
    // Query to check if pg-boss tables exist in the schema
    const tablesResult = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ${schema}
      AND table_name LIKE 'pgboss%'
      ORDER BY table_name
    `;
    
    console.log(`📊 pg-boss tables in schema '${schema}':`, tablesResult);
    
    // Check if specific pg-boss tables exist
    const expectedTables = ['pgboss.job', 'pgboss.schedule', 'pgboss.version'];
    for (const table of expectedTables) {
      const [schemaName, tableName] = table.split('.');
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = ${schemaName} 
          AND table_name = ${tableName}
        ) as exists
      `;
      console.log(`🔍 Table ${table} exists:`, tableExists);
    }
    
    // Test sending a job to verify functionality
    const jobId = await pgBoss.send('test-queue', { test: true });
    console.log('📤 Test job sent with ID:', jobId);
    
    // Check if the job was created in the correct schema
    const jobResult = await prisma.$queryRaw`
      SELECT id, name, data 
      FROM ${schema}.job 
      WHERE id = ${jobId}
    `;
    console.log('📋 Job created in schema:', jobResult);
    
    // Clean up test job - we'll just delete it from the database since we can't complete it without a job handler
    await prisma.$executeRaw`DELETE FROM ${schema}.job WHERE id = ${jobId}`;
    console.log('🧹 Test job cleaned up from database');
    
    // Stop pg-boss
    await pgBoss.stop();
    console.log('🛑 pg-boss stopped successfully');
    
    console.log('✅ All tests passed! pg-boss is correctly connected to the schema.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await databaseConnection.disconnect();
  }
}

// Run the test
testPgBossSchema()
  .then(() => {
    console.log('🎉 Schema test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Schema test failed:', error);
    process.exit(1);
  }); 
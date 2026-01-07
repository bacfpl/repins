/**
 * Script để test kết nối MongoDB
 * Chạy: npx ts-node frontend/src/DataBase/test-connection.ts
 */

import { connect, testConnection, close } from './mongodb.connection';
import { mongodbConfig } from './mongodb.config';

async function testMongoConnection() {
  try {
    console.log('🔄 Đang kiểm tra kết nối MongoDB...');
    console.log(`📍 URI: ${mongodbConfig.uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    console.log(`📊 Database: ${mongodbConfig.database}`);
    
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('✅ Kết nối MongoDB thành công!');
      
      // Test lấy database info
      const db = await connect();
      const admin = db.admin();
      const serverStatus = await admin.serverStatus();
      
      console.log(`📦 MongoDB Version: ${serverStatus.version}`);
      console.log(`💾 Database: ${db.databaseName}`);
      
      // List collections
      const collections = await db.listCollections().toArray();
      console.log(`📚 Collections (${collections.length}):`, collections.map(c => c.name).join(', ') || 'Chưa có');
      
    } else {
      console.log('❌ Không thể kết nối tới MongoDB');
      process.exit(1);
    }
    
    await close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    if (error instanceof Error) {
      console.error('📝 Chi tiết:', error.message);
    }
    process.exit(1);
  }
}

testMongoConnection();



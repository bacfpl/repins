/**
 * Script tạo database "repins" bằng cách insert document đầu tiên
 * Chạy: npm run create-db
 */

import { connect, close, getCollection } from './mongodb.connection';
import { mongodbConfig } from './mongodb.config';

async function createDatabase() {
  try {
    console.log('🚀 Đang tạo database "repins"...');
    console.log(`🔗 URI: ${mongodbConfig.uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@')}`);
    
    // Kết nối
    const db = await connect();
    console.log(`✅ Đã kết nối tới MongoDB`);
    console.log(`📊 Database: ${db.databaseName}`);
    
    // Tạo database bằng cách insert một document tạm vào collection bất kỳ
    // MongoDB sẽ tự động tạo database và collection khi insert document đầu tiên
    const testCollection = await getCollection('_init');
    
    // Insert và xóa ngay document tạm để tạo database
    const result = await testCollection.insertOne({
      _created: new Date(),
      _purpose: 'database_initialization',
      _temp: true
    });
    
    console.log(`✅ Đã tạo database "${db.databaseName}"`);
    console.log(`📝 Document ID: ${result.insertedId}`);
    
    // Xóa document tạm
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log(`🧹 Đã xóa document tạm`);
    
    // Xóa collection tạm nếu rỗng
    const count = await testCollection.countDocuments();
    if (count === 0) {
      await testCollection.drop();
      console.log(`🧹 Đã xóa collection tạm`);
    }
    
    // Kiểm tra database đã tồn tại
    const admin = db.admin();
    const databases = await admin.listDatabases();
    const dbExists = databases.databases.some(d => d.name === db.databaseName);
    
    if (dbExists) {
      console.log(`\n✅ Database "${db.databaseName}" đã được tạo thành công!`);
      console.log(`📊 Bạn có thể thấy database này trong MongoDB Compass bây giờ.`);
    } else {
      console.log(`\n⚠️  Database "${db.databaseName}" có thể chưa xuất hiện ngay.`);
      console.log(`💡 Hãy refresh MongoDB Compass hoặc đợi vài giây.`);
    }
    
    await close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Lỗi khi tạo database:', error);
    if (error instanceof Error) {
      console.error('📝 Chi tiết:', error.message);
      if (error.message.includes('authentication failed')) {
        console.error('\n💡 Gợi ý:');
        console.error('   1. Kiểm tra lại username và password trong .env.local');
        console.error('   2. Đảm bảo user có quyền truy cập database');
        console.error('   3. Kiểm tra Network Access trong MongoDB Atlas');
      }
    }
    await close();
    process.exit(1);
  }
}

createDatabase();



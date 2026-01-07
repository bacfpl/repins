/**
 * Script khởi tạo database "repins"
 * Chạy: npx ts-node frontend/src/DataBase/init-database.ts
 * Hoặc: npm run init-db (nếu có script)
 */

import { connect, close, testConnection, getCollection } from './mongodb.connection';
import { initializeIndexes } from './mongodb.schema';
import { seedDatabase } from './mongodb.seed';
import { mongodbConfig } from './mongodb.config';
import { COLLECTIONS } from './mongodb.schema';

async function initDatabase() {
  try {
    console.log('🚀 Bắt đầu khởi tạo database...');
    console.log(`📊 Database name: ${mongodbConfig.database}`);
    console.log(`🔗 URI: ${mongodbConfig.uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@')}`);
    
    // 1. Test kết nối
    console.log('\n📡 Đang kiểm tra kết nối...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      throw new Error('❌ Không thể kết nối tới MongoDB. Vui lòng kiểm tra connection string.');
    }
    console.log('✅ Kết nối thành công!');
    
    // 2. Lấy database instance (MongoDB tự động tạo database khi cần)
    console.log(`\n📦 Đang khởi tạo database "${mongodbConfig.database}"...`);
    const db = await connect();
    
    // 3. Kiểm tra database đã tồn tại chưa
    const admin = db.admin();
    const databases = await admin.listDatabases();
    const dbExists = databases.databases.some(d => d.name === mongodbConfig.database);
    
    if (dbExists) {
      console.log(`ℹ️  Database "${mongodbConfig.database}" đã tồn tại`);
    } else {
      console.log(`✅ Database "${mongodbConfig.database}" sẽ được tạo tự động khi insert dữ liệu đầu tiên`);
    }
    
    // 4. Tạo collections và indexes
    console.log('\n🔧 Đang tạo indexes...');
    await initializeIndexes();
    console.log('✅ Đã tạo tất cả indexes');
    
    // 5. Kiểm tra collections
    console.log('\n📚 Đang kiểm tra collections...');
    const collections = await db.listCollections().toArray();
    console.log(`📋 Collections hiện có (${collections.length}):`);
    if (collections.length === 0) {
      console.log('   (Chưa có collection nào)');
    } else {
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    }
    
    // 6. Tạo collections cơ bản nếu chưa có
    const requiredCollections = [
      COLLECTIONS.CATEGORIES,
      COLLECTIONS.BRANDS,
      COLLECTIONS.PRODUCTS,
      COLLECTIONS.PRODUCT_IMAGES,
      COLLECTIONS.PRODUCT_SPECIFICATIONS,
      COLLECTIONS.CUSTOMERS,
      COLLECTIONS.ORDERS,
      COLLECTIONS.ORDER_ITEMS,
      COLLECTIONS.PRODUCT_REVIEWS,
      COLLECTIONS.PROMOTIONS
    ];
    
    const existingCollectionNames = collections.map(c => c.name);
    const missingCollections = requiredCollections.filter(
      name => !existingCollectionNames.includes(name)
    );
    
    if (missingCollections.length > 0) {
      console.log(`\n📝 Đang tạo ${missingCollections.length} collections...`);
      for (const collectionName of missingCollections) {
        await db.createCollection(collectionName);
        console.log(`   ✅ Đã tạo collection: ${collectionName}`);
      }
    } else {
      console.log('\n✅ Tất cả collections đã tồn tại');
    }
    
    // 7. Seed dữ liệu mẫu (nếu chưa có)
    console.log('\n🌱 Đang kiểm tra dữ liệu mẫu...');
    const productsCollection = await getCollection('products');
    const productCount = await productsCollection.countDocuments();
    
    if (productCount === 0) {
      console.log('📥 Đang chèn dữ liệu mẫu...');
      await seedDatabase();
      console.log('✅ Đã chèn dữ liệu mẫu thành công!');
    } else {
      console.log(`ℹ️  Đã có ${productCount} sản phẩm trong database, bỏ qua seed data`);
    }
    
    // 8. Hiển thị thống kê
    console.log('\n📊 Thống kê database:');
    const stats = await db.stats();
    console.log(`   - Database: ${db.databaseName}`);
    console.log(`   - Collections: ${(await db.listCollections().toArray()).length}`);
    console.log(`   - Data size: ${(stats.dataSize / 1024).toFixed(2)} KB`);
    console.log(`   - Storage size: ${(stats.storageSize / 1024).toFixed(2)} KB`);
    
    // 9. Đếm documents trong các collections chính
    console.log('\n📈 Số lượng documents:');
    const mainCollections = ['categories', 'brands', 'products', 'customers', 'orders'];
    for (const colName of mainCollections) {
      try {
        const col = await getCollection(colName);
        const count = await col.countDocuments();
        console.log(`   - ${colName}: ${count}`);
      } catch (error) {
        // Collection chưa tồn tại, bỏ qua
      }
    }
    
    console.log('\n✅ Hoàn thành khởi tạo database!');
    console.log(`🎉 Database "${mongodbConfig.database}" đã sẵn sàng sử dụng!`);
    
    await close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Lỗi khi khởi tạo database:', error);
    if (error instanceof Error) {
      console.error('📝 Chi tiết:', error.message);
    }
    await close();
    process.exit(1);
  }
}

// Chạy script
initDatabase();


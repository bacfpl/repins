/**
 * Script debug kết nối MongoDB
 * Chạy: npm run debug-db
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function debugConnection() {
  try {
    console.log('🔍 Đang kiểm tra cấu hình kết nối MongoDB...\n');
    
    // 1. Kiểm tra biến môi trường
    const uri = process.env.MONGODB_URI;
    const database = process.env.MONGODB_DATABASE;
    
    console.log('📋 Kiểm tra Environment Variables:');
    console.log(`   MONGODB_URI: ${uri ? (uri.includes('@') ? uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@') : uri) : '❌ KHÔNG TỒN TẠI'}`);
    console.log(`   MONGODB_DATABASE: ${database || '❌ KHÔNG TỒN TẠI'}`);
    
    if (!uri) {
      console.error('\n❌ Lỗi: MONGODB_URI không được tìm thấy!');
      console.error('💡 Hãy tạo file .env.local trong thư mục frontend/ với nội dung:');
      console.error('   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database');
      console.error('   MONGODB_DATABASE=repins');
      process.exit(1);
    }
    
    if (!database) {
      console.error('\n⚠️  Cảnh báo: MONGODB_DATABASE không được tìm thấy, sẽ dùng giá trị mặc định');
    }
    
    // 2. Phân tích connection string
    console.log('\n📊 Phân tích Connection String:');
    try {
      const url = new URL(uri);
      console.log(`   Protocol: ${url.protocol}`);
      console.log(`   Username: ${url.username || '❌ KHÔNG CÓ'}`);
      console.log(`   Password: ${url.password ? '***' : '❌ KHÔNG CÓ'}`);
      console.log(`   Host: ${url.hostname}`);
      console.log(`   Port: ${url.port || 'default'}`);
      console.log(`   Pathname: ${url.pathname || '/'}`);
      console.log(`   Search: ${url.search || 'no options'}`);
      
      // Kiểm tra các vấn đề phổ biến
      console.log('\n🔍 Kiểm tra các vấn đề phổ biến:');
      
      if (uri.includes('<db_password>')) {
        console.error('   ❌ Connection string chứa placeholder <db_password>');
        console.error('      → Cần thay bằng password thật');
      } else {
        console.log('   ✅ Không có placeholder password');
      }
      
      if (!url.password) {
        console.error('   ❌ Connection string không có password');
        console.error('      → Format: mongodb+srv://username:password@host');
      } else {
        console.log('   ✅ Có password trong connection string');
      }
      
      if (url.password && url.password.length < 3) {
        console.error('   ⚠️  Password có vẻ quá ngắn');
      }
      
      if (uri.includes('localhost') && uri.includes('mongodb+srv://')) {
        console.error('   ❌ Không thể dùng mongodb+srv:// với localhost');
        console.error('      → Dùng mongodb://localhost:27017 cho local');
      }
      
    } catch (error) {
      console.error('   ❌ Connection string không hợp lệ:', error);
    }
    
    // 3. Thử kết nối
    console.log('\n🔌 Đang thử kết nối...');
    const { MongoClient } = await import('mongodb');
    
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    try {
      await client.connect();
      console.log('   ✅ Kết nối thành công!');
      
      // Test ping
      await client.db().admin().ping();
      console.log('   ✅ Ping thành công!');
      
      // List databases
      const admin = client.db().admin();
      const databases = await admin.listDatabases();
      console.log(`\n📚 Databases có sẵn (${databases.databases.length}):`);
      databases.databases.forEach(db => {
        const size = db.sizeOnDisk ? (db.sizeOnDisk / 1024 / 1024).toFixed(2) : '0';
        console.log(`   - ${db.name} (${size} MB)`);
      });
      
      // Kiểm tra database repins
      const targetDb = database || 'repins';
      const dbExists = databases.databases.some(d => d.name === targetDb);
      if (dbExists) {
        console.log(`\n✅ Database "${targetDb}" đã tồn tại!`);
      } else {
        console.log(`\n⚠️  Database "${targetDb}" chưa tồn tại`);
        console.log('   → Database sẽ được tạo tự động khi insert document đầu tiên');
      }
      
      await client.close();
      console.log('\n✅ Tất cả kiểm tra đều thành công!');
      process.exit(0);
      
    } catch (error: any) {
      console.error('\n❌ Lỗi kết nối:');
      console.error(`   Code: ${error.code || 'N/A'}`);
      console.error(`   CodeName: ${error.codeName || 'N/A'}`);
      console.error(`   Message: ${error.message}`);
      
      // Phân tích lỗi
      console.log('\n💡 Phân tích lỗi:');
      
      if (error.code === 8000 || error.message.includes('authentication failed')) {
        console.error('   ❌ Lỗi xác thực (authentication failed)');
        console.error('   → Kiểm tra:');
        console.error('      1. Username và password có đúng không?');
        console.error('      2. User có quyền truy cập database không?');
        console.error('      3. Password có chứa ký tự đặc biệt cần encode không? (@, :, /, #, ?, [])');
      }
      
      if (error.code === 6 || error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
        console.error('   ❌ Không tìm thấy server');
        console.error('   → Kiểm tra:');
        console.error('      1. Connection string có đúng không?');
        console.error('      2. Internet có kết nối không?');
        console.error('      3. Firewall có chặn không?');
      }
      
      if (error.code === 13 || error.message.includes('not authorized')) {
        console.error('   ❌ Không có quyền truy cập');
        console.error('   → Kiểm tra:');
        console.error('      1. User có quyền readWrite trên database không?');
        console.error('      2. Network Access có cho phép IP của bạn không?');
      }
      
      if (error.message.includes('timeout') || error.code === 'ETIMEDOUT') {
        console.error('   ❌ Timeout khi kết nối');
        console.error('   → Kiểm tra:');
        console.error('      1. Network Access trong MongoDB Atlas có whitelist IP của bạn không?');
        console.error('      2. Thử thêm IP 0.0.0.0/0 (cho phép tất cả) - chỉ dùng cho dev');
      }
      
      process.exit(1);
    }
    
  } catch (error: any) {
    console.error('\n❌ Lỗi không mong đợi:', error.message);
    process.exit(1);
  }
}

debugConnection();


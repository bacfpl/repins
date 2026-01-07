/**
 * Script khắc phục lỗi HandshakeError
 * Chạy: npm run fix-handshake
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { MongoClient } from 'mongodb';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function fixHandshake() {
  try {
    const uri = process.env.MONGODB_URI;
    const database = process.env.MONGODB_DATABASE || 'repins';
    
    if (!uri) {
      console.error('❌ MONGODB_URI không được tìm thấy trong .env.local');
      process.exit(1);
    }
    
    console.log('🔧 Đang khắc phục lỗi HandshakeError...\n');
    console.log('📋 Thông tin kết nối:');
    console.log(`   URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@')}`);
    console.log(`   Database: ${database}\n`);
    
    // Tùy chọn kết nối với xử lý handshake tốt hơn
    const options = {
      serverSelectionTimeoutMS: 15000, // Tăng timeout
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      retryReads: true,
      maxPoolSize: 10,
      minPoolSize: 5,
      // Tùy chọn để xử lý handshake tốt hơn
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
    };
    
    console.log('🔌 Đang thử kết nối với cấu hình tối ưu...');
    
    const client = new MongoClient(uri, options);
    
    try {
      // Thử kết nối với timeout dài hơn
      await Promise.race([
        client.connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout after 15 seconds')), 15000)
        )
      ]);
      
      console.log('✅ Kết nối thành công!');
      
      // Test ping
      await client.db().admin().ping();
      console.log('✅ Ping thành công!');
      
      // Kiểm tra database
      const db = client.db(database);
      const admin = db.admin();
      const databases = await admin.listDatabases();
      const dbExists = databases.databases.some(d => d.name === database);
      
      if (dbExists) {
        console.log(`✅ Database "${database}" đã tồn tại`);
      } else {
        console.log(`⚠️  Database "${database}" chưa tồn tại`);
        console.log('   → Sẽ được tạo tự động khi insert document đầu tiên');
        
        // Tạo database bằng cách insert document tạm
        const testCollection = db.collection('_init');
        await testCollection.insertOne({ _created: new Date(), _temp: true });
        await testCollection.deleteOne({ _created: new Date() });
        console.log(`✅ Đã tạo database "${database}"`);
      }
      
      await client.close();
      console.log('\n✅ Tất cả đều hoạt động tốt!');
      process.exit(0);
      
    } catch (error: any) {
      await client.close();
      
      console.error('\n❌ Lỗi kết nối:');
      console.error(`   Code: ${error.code || 'N/A'}`);
      console.error(`   CodeName: ${error.codeName || 'N/A'}`);
      console.error(`   Message: ${error.message}`);
      
      if (error.errorLabelSet) {
        console.error(`   Error Labels: ${Array.from(error.errorLabelSet).join(', ')}`);
      }
      
      // Phân tích lỗi cụ thể
      console.log('\n💡 Phân tích và giải pháp:');
      
      if (error.codeName === 'HandshakeError' || 
          (error.errorLabelSet && error.errorLabelSet.has('HandshakeError'))) {
        console.error('\n🔧 Lỗi HandshakeError - Các nguyên nhân và giải pháp:');
        console.error('\n1. Network/Firewall Issues:');
        console.error('   → Kiểm tra firewall có chặn kết nối không');
        console.error('   → Kiểm tra proxy/VPN có ảnh hưởng không');
        console.error('   → Thử tắt firewall tạm thời để test');
        
        console.error('\n2. MongoDB Atlas Network Access:');
        console.error('   → Vào MongoDB Atlas → Network Access');
        console.error('   → Thêm IP của bạn hoặc 0.0.0.0/0 (cho dev)');
        console.error('   → Đợi 2-3 phút để cập nhật');
        
        console.error('\n3. Connection String Issues:');
        console.error('   → Kiểm tra connection string có đúng format không');
        console.error('   → Thử lấy connection string mới từ MongoDB Atlas');
        console.error('   → Đảm bảo không có khoảng trắng thừa');
        
        console.error('\n4. SSL/TLS Issues:');
        console.error('   → Thử thêm ?tls=true vào connection string');
        console.error('   → Kiểm tra certificate có hợp lệ không');
        
        console.error('\n5. Timeout Issues:');
        console.error('   → Tăng serverSelectionTimeoutMS và connectTimeoutMS');
        console.error('   → Kiểm tra network latency');
      }
      
      if (error.code === 8000 || error.message.includes('authentication')) {
        console.error('\n🔐 Lỗi Authentication:');
        console.error('   → Reset password trong MongoDB Atlas');
        console.error('   → Cập nhật password trong .env.local');
        console.error('   → Đảm bảo user có quyền truy cập');
      }
      
      if (error.message.includes('timeout')) {
        console.error('\n⏱️  Lỗi Timeout:');
        console.error('   → Network có thể chậm');
        console.error('   → Thử tăng timeout trong options');
        console.error('   → Kiểm tra internet connection');
      }
      
      console.error('\n📝 Các bước tiếp theo:');
      console.error('   1. Kiểm tra Network Access trong MongoDB Atlas');
      console.error('   2. Reset password và cập nhật .env.local');
      console.error('   3. Thử kết nối từ MongoDB Compass để xác nhận connection string');
      console.error('   4. Kiểm tra firewall/antivirus có chặn không');
      
      process.exit(1);
    }
    
  } catch (error: any) {
    console.error('\n❌ Lỗi không mong đợi:', error.message);
    process.exit(1);
  }
}

fixHandshake();



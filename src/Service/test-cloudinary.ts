/**
 * Script test kết nối Cloudinary
 * Chạy: npm run test-cloudinary
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { v2 as cloudinary } from 'cloudinary';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function testCloudinary() {
  try {
    console.log('🔍 Đang kiểm tra cấu hình Cloudinary...\n');

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    console.log('📋 Kiểm tra Environment Variables:');
    console.log(`   CLOUDINARY_CLOUD_NAME: ${cloudName || '❌ KHÔNG TỒN TẠI'}`);
    console.log(`   CLOUDINARY_API_KEY: ${apiKey ? '***' + apiKey.slice(-4) : '❌ KHÔNG TỒN TẠI'}`);
    console.log(`   CLOUDINARY_API_SECRET: ${apiSecret ? '***' + apiSecret.slice(-4) : '❌ KHÔNG TỒN TẠI'}`);

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('\n❌ Thiếu thông tin cấu hình Cloudinary!');
      console.error('💡 Vui lòng kiểm tra file .env.local');
      process.exit(1);
    }

    // Cấu hình Cloudinary
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    console.log('\n🔌 Đang test kết nối Cloudinary...');

    // Test ping
    const pingResult = await cloudinary.api.ping();
    console.log('✅ Kết nối thành công!');
    console.log(`   Status: ${pingResult.status}`);

    // Test upload một ảnh nhỏ (base64)
    console.log('\n📤 Đang test upload ảnh...');
    const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    const uploadResult = await cloudinary.uploader.upload(testImage, {
      folder: 'test',
      public_id: 'test-connection',
      overwrite: true,
    });

    console.log('✅ Upload test thành công!');
    console.log(`   Public ID: ${uploadResult.public_id}`);
    console.log(`   URL: ${uploadResult.secure_url}`);
    console.log(`   Folder: ${uploadResult.folder || 'root'}`);

    // Xóa ảnh test
    await cloudinary.uploader.destroy(uploadResult.public_id);
    console.log('🧹 Đã xóa ảnh test');

    console.log('\n✅ Tất cả kiểm tra đều thành công!');
    console.log(`📁 Cloud Name: ${cloudName}`);
    console.log('🎉 Cloudinary đã sẵn sàng sử dụng!');
    console.log('\n💡 Đường dẫn upload sẽ là: products/{productId}/image.jpg');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Lỗi:', error.message);
    if (error.http_code === 401) {
      console.error('💡 Lỗi xác thực - Kiểm tra lại API Key và API Secret');
    } else if (error.http_code === 404) {
      console.error('💡 Cloud Name không đúng hoặc không tồn tại');
    }
    process.exit(1);
  }
}

testCloudinary();



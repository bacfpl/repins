import { getCollection } from './DataBase/mongodb.connection';
import { COLLECTIONS, ProductImage, Product } from './DataBase/mongodb.schema';

/**
 * Script test: Kiểm tra dữ liệu ảnh trong MongoDB
 * Chạy: npx ts-node --project tsconfig.scripts.json src/test-image-data.ts
 */

async function testImageData() {
  try {
    console.log('🔍 Đang kiểm tra dữ liệu ảnh trong MongoDB...\n');

    // 1. Lấy tất cả products
    const productsCollection = await getCollection<Product>(COLLECTIONS.PRODUCTS);
    const products = await productsCollection.find({}).limit(5).toArray();

    console.log(`📦 Tìm thấy ${products.length} sản phẩm:`);
    products.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} (ID: ${p._id})`);
    });

    // 2. Kiểm tra collection productImages
    const imagesCollection = await getCollection<ProductImage>(COLLECTIONS.PRODUCT_IMAGES);
    const totalImages = await imagesCollection.countDocuments();

    console.log(`\n🖼️  Tổng số ảnh trong productImages: ${totalImages}`);

    if (totalImages > 0) {
      // Lấy 5 ảnh gần nhất
      const recentImages = await imagesCollection
        .find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray();

      console.log('\n📸 Ảnh gần nhất:');
      recentImages.forEach((img, i) => {
        console.log(`
  ${i + 1}. ID: ${img._id}
     Product ID: ${img.productId}
     URL: ${img.imageUrl}
     Chính: ${img.isPrimary ? '✅' : '❌'}
     Thứ tự: ${img.displayOrder}
     Upload lúc: ${img.uploadedAt}`);
      });

      // 3. Kiểm tra ảnh theo product
      if (products.length > 0) {
        const firstProductId = products[0]._id?.toString();
        console.log(`\n🔎 Ảnh của sản phẩm "${products[0].name}":"`);

        const productImages = await imagesCollection
          .find({ productId: firstProductId })
          .sort({ displayOrder: 1 })
          .toArray();

        if (productImages.length > 0) {
          console.log(`   Tìm thấy ${productImages.length} ảnh:`);
          productImages.forEach((img, i) => {
            console.log(`   ${i + 1}. ${img.imageUrl} (${img.isPrimary ? 'Chính' : 'Phụ'})`);
          });
        } else {
          console.log('   ⚠️  Sản phẩm này chưa có ảnh');
        }
      }
    } else {
      console.log('⚠️  Chưa có ảnh nào trong database. Vui lòng upload ảnh trước.');
    }

    console.log('\n✅ Kiểm tra hoàn tất');
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

testImageData();

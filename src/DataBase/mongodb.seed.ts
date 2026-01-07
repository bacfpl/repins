/**
 * MongoDB Seed Data
 * Script để chèn dữ liệu mẫu vào MongoDB
 */

import { getCollection } from './mongodb.connection';
import { COLLECTIONS, Category, Brand, Product, initializeIndexes } from './mongodb.schema';

export async function seedDatabase(): Promise<void> {
  try {
    console.log('🔄 Đang khởi tạo indexes...');
    await initializeIndexes();

    console.log('🔄 Đang chèn dữ liệu mẫu...');

    // Seed Categories
    const categoriesCollection = await getCollection<Category>(COLLECTIONS.CATEGORIES);
    const existingCategories = await categoriesCollection.countDocuments();
    
    if (existingCategories === 0) {
      const categories: Omit<Category, '_id'>[] = [
        {
          name: 'Điện tử',
          description: 'Các sản phẩm điện tử, công nghệ',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Thời trang',
          description: 'Quần áo, phụ kiện thời trang',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Gia dụng',
          description: 'Đồ dùng gia đình, nội thất',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Thể thao',
          description: 'Đồ thể thao, dụng cụ tập luyện',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Sách',
          description: 'Sách vở, tài liệu',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const categoryResult = await categoriesCollection.insertMany(categories);
      console.log(`✅ Đã chèn ${categoryResult.insertedCount} danh mục`);

      // Seed Brands
      const brandsCollection = await getCollection<Brand>(COLLECTIONS.BRANDS);
      const brands: Omit<Brand, '_id'>[] = [
        {
          name: 'Brand A',
          description: 'Thương hiệu A - Chất lượng cao',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Brand B',
          description: 'Thương hiệu B - Giá cả hợp lý',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Brand C',
          description: 'Thương hiệu C - Thiết kế hiện đại',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Brand D',
          description: 'Thương hiệu D - Độ bền cao',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'Brand E',
          description: 'Thương hiệu E - Thân thiện môi trường',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const brandResult = await brandsCollection.insertMany(brands);
      console.log(`✅ Đã chèn ${brandResult.insertedCount} thương hiệu`);

      // Seed Products
      const productsCollection = await getCollection<Product>(COLLECTIONS.PRODUCTS);
      const existingProducts = await productsCollection.countDocuments();

      if (existingProducts === 0) {
        // Lấy category và brand IDs
        const categories = await categoriesCollection.find({}).toArray();
        const brands = await brandsCollection.find({}).toArray();

        const products: Omit<Product, '_id'>[] = [
          {
            name: 'Sản phẩm 1',
            sku: 'SP001',
            priceValue: 1500000,
            price: '1.500.000₫',
            categoryId: categories[0]._id!.toString(),
            brandId: brands[0]._id!.toString(),
            image: 'https://picsum.photos/id/1/400/300',
            images: [
              'https://picsum.photos/id/1/400/300',
              'https://picsum.photos/id/11/400/300',
              'https://picsum.photos/id/21/400/300',
              'https://picsum.photos/id/31/400/300',
            ],
            description: 'Mô tả sản phẩm 1',
            stock: 50,
            vat: 'VAT',
            ship: 'SHIP',
            isActive: true,
            isFeatured: true,
            viewCount: 0,
            specifications: [
              { label: 'Thương hiệu', value: 'Brand A' },
              { label: 'Mã sản phẩm', value: 'SP001' },
              { label: 'Trọng lượng', value: '1.5 kg' },
              { label: 'Kích thước', value: '20 x 15 x 10 cm' },
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Sản phẩm 2',
            sku: 'SP002',
            priceValue: 1200000,
            price: '1.200.000₫',
            categoryId: categories[1]._id!.toString(),
            brandId: brands[1]._id!.toString(),
            image: 'https://picsum.photos/id/2/400/300',
            stock: 30,
            ship: 'SHIP',
            isActive: true,
            isFeatured: false,
            viewCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Sản phẩm 3',
            sku: 'SP003',
            priceValue: 800000,
            price: '800.000₫',
            categoryId: categories[2]._id!.toString(),
            brandId: brands[2]._id!.toString(),
            image: 'https://picsum.photos/id/3/400/300',
            stock: 100,
            vat: 'VAT',
            isActive: true,
            isFeatured: true,
            viewCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Sản phẩm 4',
            sku: 'SP004',
            priceValue: 2000000,
            price: '2.000.000₫',
            categoryId: categories[3]._id!.toString(),
            brandId: brands[3]._id!.toString(),
            image: 'https://picsum.photos/id/4/400/300',
            stock: 25,
            ship: 'SHIP',
            isActive: true,
            isFeatured: false,
            viewCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Sản phẩm 5',
            sku: 'SP005',
            priceValue: 600000,
            price: '600.000₫',
            categoryId: categories[4]._id!.toString(),
            brandId: brands[4]._id!.toString(),
            image: 'https://picsum.photos/id/5/400/300',
            stock: 75,
            vat: 'VAT',
            isActive: true,
            isFeatured: true,
            viewCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        const productResult = await productsCollection.insertMany(products);
        console.log(`✅ Đã chèn ${productResult.insertedCount} sản phẩm`);
      } else {
        console.log('ℹ️  Dữ liệu sản phẩm đã tồn tại, bỏ qua...');
      }
    } else {
      console.log('ℹ️  Dữ liệu đã tồn tại, bỏ qua...');
    }

    console.log('✅ Hoàn thành seed database!');
  } catch (error) {
    console.error('❌ Lỗi khi seed database:', error);
    throw error;
  }
}

// Chạy seed nếu file được import trực tiếp
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seed hoàn thành!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Lỗi seed:', error);
      process.exit(1);
    });
}


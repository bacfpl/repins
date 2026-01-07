# MongoDB Setup Guide

## Tổng quan

Dự án đã được chuyển đổi từ SQL Server sang MongoDB. Tất cả các file MongoDB được đặt trong thư mục `frontend/src/DataBase/`.

## Cài đặt

### 1. Cài đặt MongoDB

**Local MongoDB:**
```bash
# Windows (sử dụng Chocolatey)
choco install mongodb

# Hoặc tải từ: https://www.mongodb.com/try/download/community
```

**MongoDB Atlas (Cloud):**
- Đăng ký tại: https://www.mongodb.com/cloud/atlas
- Tạo cluster miễn phí
- Lấy connection string

### 2. Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục `frontend/`:

```env
# MongoDB Local
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=productdb

# Hoặc MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
# MONGODB_DATABASE=productdb

# Optional - Connection Pool Settings
MONGODB_MAX_POOL_SIZE=10
MONGODB_MIN_POOL_SIZE=5
MONGODB_MAX_IDLE_TIME_MS=30000
MONGODB_SERVER_SELECTION_TIMEOUT_MS=5000
MONGODB_SOCKET_TIMEOUT_MS=45000
```

### 3. Khởi tạo Database và Seed Data

Tạo file script để chạy seed:

```typescript
// scripts/seed.ts
import { seedDatabase } from '../src/DataBase/mongodb.seed';

seedDatabase()
  .then(() => {
    console.log('✅ Seed hoàn thành!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Lỗi seed:', error);
    process.exit(1);
  });
```

Hoặc chạy trực tiếp:
```bash
npx ts-node frontend/src/DataBase/mongodb.seed.ts
```

## Cấu trúc Files

### `mongodb.config.ts`
- Cấu hình kết nối MongoDB
- Đọc từ environment variables

### `mongodb.connection.ts`
- Quản lý kết nối MongoDB
- Hàm `connect()`, `close()`, `getCollection()`, `testConnection()`

### `mongodb.schema.ts`
- Định nghĩa interfaces cho các collections
- Hàm `initializeIndexes()` để tạo indexes

### `mongodb.seed.ts`
- Script để chèn dữ liệu mẫu
- Categories, Brands, Products

## Collections

1. **categories** - Danh mục sản phẩm
2. **brands** - Thương hiệu
3. **products** - Sản phẩm
4. **productImages** - Hình ảnh sản phẩm
5. **productSpecifications** - Thông số kỹ thuật
6. **customers** - Khách hàng
7. **orders** - Đơn hàng
8. **orderItems** - Chi tiết đơn hàng
9. **productReviews** - Đánh giá sản phẩm
10. **promotions** - Khuyến mãi

## Sử dụng trong Code

### Import và sử dụng:

```typescript
import { getCollection } from '@/DataBase/mongodb.connection';
import { COLLECTIONS, Product } from '@/DataBase/mongodb.schema';

// Lấy collection
const productsCollection = await getCollection<Product>(COLLECTIONS.PRODUCTS);

// Query
const products = await productsCollection
  .find({ isActive: true })
  .sort({ priceValue: 1 })
  .limit(10)
  .toArray();
```

### Sử dụng ProductService:

```typescript
import {
  getProductsByPage,
  getProductsByBrand,
  getProductsByCategory,
  getProductsByPriceRange,
  getProductsWithFilter,
  getProductById
} from '@/Service/ProductService.mongodb';

// Lấy sản phẩm theo trang
const result = await getProductsByPage(1, 12);

// Lấy sản phẩm theo thương hiệu
const brandProducts = await getProductsByBrand('Brand A', 1, 12);

// Lấy sản phẩm theo khoảng giá
const priceProducts = await getProductsByPriceRange(500000, 2000000, 1, 12, 'price_asc');
```

## Indexes

Các indexes đã được tự động tạo:
- `categories.name` (unique)
- `brands.name` (unique)
- `products.sku` (unique)
- `products.categoryId`
- `products.brandId`
- `products.priceValue`
- `products.isActive`
- Và nhiều indexes khác...

## Migration từ SQL Server

Nếu bạn đã có dữ liệu trong SQL Server, bạn có thể:

1. Export dữ liệu từ SQL Server sang JSON/CSV
2. Viết script migration để import vào MongoDB
3. Hoặc sử dụng công cụ migration như `mongoimport`

## Lưu ý

1. **ObjectId**: MongoDB sử dụng ObjectId làm _id mặc định. Code đã xử lý cả ObjectId và string.

2. **Connection Pooling**: MongoDB driver tự động quản lý connection pool.

3. **Transactions**: MongoDB hỗ trợ transactions cho replica sets và sharded clusters.

4. **Performance**: Sử dụng indexes để tối ưu query performance.

5. **Data Types**: 
   - Dates được lưu dưới dạng Date objects
   - Numbers được lưu dưới dạng number (không phải string)
   - Arrays và Objects được lưu trực tiếp

## Troubleshooting

### Lỗi kết nối:
- Kiểm tra MongoDB đã chạy chưa: `mongosh` hoặc `mongo`
- Kiểm tra connection string trong `.env.local`
- Kiểm tra firewall/network settings

### Lỗi authentication:
- Kiểm tra username/password trong connection string
- Đảm bảo user có quyền truy cập database

### Lỗi index:
- Chạy lại `initializeIndexes()` nếu cần
- Kiểm tra logs để xem index nào bị lỗi

## Tài liệu tham khảo

- [MongoDB Node.js Driver](https://docs.mongodb.com/drivers/node/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)



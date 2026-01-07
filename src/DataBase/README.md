# Database Schema - Hệ thống Quản lý Sản phẩm

## Tổng quan

File `database_schema.sql` chứa script tạo database và các bảng cho hệ thống quản lý sản phẩm.

## Các bảng trong hệ thống

### 1. **Categories** - Danh mục sản phẩm
- Lưu trữ các danh mục sản phẩm (Điện tử, Thời trang, Gia dụng, v.v.)
- Trường chính: `id`, `name`, `description`, `image`

### 2. **Brands** - Thương hiệu
- Lưu trữ thông tin các thương hiệu
- Trường chính: `id`, `name`, `description`, `logo`, `website`

### 3. **Products** - Sản phẩm
- Bảng chính lưu trữ thông tin sản phẩm
- Trường chính: `id`, `name`, `sku`, `priceValue`, `price`, `categoryId`, `brandId`
- Có quan hệ với `Categories` và `Brands`

### 4. **ProductImages** - Hình ảnh sản phẩm
- Lưu trữ nhiều hình ảnh cho mỗi sản phẩm
- Trường chính: `id`, `productId`, `imageUrl`, `displayOrder`, `isPrimary`

### 5. **ProductSpecifications** - Thông số kỹ thuật
- Lưu trữ các thông số kỹ thuật của sản phẩm
- Trường chính: `id`, `productId`, `label`, `value`, `displayOrder`

### 6. **Customers** - Khách hàng
- Lưu trữ thông tin khách hàng
- Trường chính: `id`, `email`, `phone`, `fullName`, `address`

### 7. **Orders** - Đơn hàng
- Lưu trữ thông tin đơn hàng
- Trường chính: `id`, `orderNumber`, `customerId`, `totalAmount`, `status`, `paymentStatus`

### 8. **OrderItems** - Chi tiết đơn hàng
- Lưu trữ các sản phẩm trong đơn hàng
- Trường chính: `id`, `orderId`, `productId`, `quantity`, `unitPrice`, `totalPrice`

### 9. **ProductReviews** - Đánh giá sản phẩm
- Lưu trữ đánh giá và bình luận của khách hàng
- Trường chính: `id`, `productId`, `customerId`, `rating`, `comment`

### 10. **Promotions** - Khuyến mãi
- Lưu trữ thông tin các chương trình khuyến mãi
- Trường chính: `id`, `name`, `discountType`, `discountValue`, `startDate`, `endDate`

### 11. **ProductPromotions** - Liên kết Sản phẩm - Khuyến mãi
- Bảng trung gian liên kết sản phẩm với khuyến mãi
- Trường chính: `id`, `productId`, `promotionId`

## Views

### vw_ProductDetails
- View tổng hợp thông tin sản phẩm kèm tên danh mục và thương hiệu
- Sử dụng: `SELECT * FROM vw_ProductDetails WHERE id = 1`

### vw_ProductWithImages
- View sản phẩm kèm danh sách hình ảnh dạng JSON
- Sử dụng: `SELECT * FROM vw_ProductWithImages WHERE id = 1`

## Stored Procedures

### sp_GetProductsByCategory
- Lấy danh sách sản phẩm theo danh mục với phân trang
- Tham số: `@categoryId`, `@page`, `@pageSize`
- Sử dụng: `EXEC sp_GetProductsByCategory @categoryId = 1, @page = 1, @pageSize = 12`

### sp_GetProductsByPriceRange
- Lấy danh sách sản phẩm theo khoảng giá với phân trang và sắp xếp
- Tham số: `@minPrice`, `@maxPrice`, `@page`, `@pageSize`, `@sortBy`
- Sử dụng: `EXEC sp_GetProductsByPriceRange @minPrice = 500000, @maxPrice = 2000000, @page = 1, @pageSize = 12, @sortBy = 'price_asc'`

## Cách sử dụng

### 1. Chạy script SQL
```sql
-- Mở SQL Server Management Studio
-- Kết nối tới SQL Server
-- Mở file database_schema.sql
-- Chạy toàn bộ script (F5)
```

### 2. Kiểm tra kết quả
```sql
-- Kiểm tra các bảng đã được tạo
SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';

-- Kiểm tra dữ liệu mẫu
SELECT * FROM Categories;
SELECT * FROM Brands;
SELECT * FROM Products;
```

### 3. Sử dụng trong ứng dụng
Các hàm trong `ProductService.ts` đã được thiết kế để làm việc với các bảng này.

## Lưu ý

1. **Database Name**: Script sẽ tạo database tên `ProductDB`. Bạn có thể thay đổi tên trong script.

2. **Dữ liệu mẫu**: Script đã bao gồm dữ liệu mẫu cho:
   - 5 danh mục (Categories)
   - 5 thương hiệu (Brands)
   - 10 sản phẩm (Products)
   - Hình ảnh và thông số kỹ thuật cho sản phẩm đầu tiên

3. **Indexes**: Các index đã được tạo tự động cho các trường thường xuyên được query:
   - `categoryId`, `brandId`, `priceValue`, `isActive` trong bảng Products

4. **Foreign Keys**: Tất cả các quan hệ đã được thiết lập với foreign keys và cascade delete khi cần.

5. **Soft Delete**: Sử dụng trường `isActive` để đánh dấu xóa mềm thay vì xóa thật.

## Cấu trúc quan hệ

```
Categories (1) ──< (N) Products (N) >── (1) Brands
Products (1) ──< (N) ProductImages
Products (1) ──< (N) ProductSpecifications
Products (1) ──< (N) ProductReviews
Products (N) >──< (N) Promotions (qua ProductPromotions)
Customers (1) ──< (N) Orders (1) ──< (N) OrderItems (N) >── (1) Products
Customers (1) ──< (N) ProductReviews
```

## Cập nhật schema

Khi cần cập nhật schema:
1. Backup database hiện tại
2. Chạy các câu lệnh ALTER TABLE
3. Hoặc tạo script migration riêng



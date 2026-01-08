// MongoDB version (default) - chỉ export ProductService, không export getProductById vì nó đã có ở AdminService
// export * from './ProductService.mongodb';

// Admin Service (sử dụng AdminService cho quản lý product)
export * from './AdminService';

// Image Service - comment out vì deleteAllProductImages đã được export từ AdminService
// export * from './ImageService';

// SQL Server version (legacy - có thể xóa nếu không dùng)
// export * from './ProductService';

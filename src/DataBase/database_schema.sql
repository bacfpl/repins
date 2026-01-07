-- =============================================
-- SQL Server Database Schema
-- Hệ thống quản lý sản phẩm
-- =============================================

USE master;
GO

-- Tạo database nếu chưa tồn tại
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ProductDB')
BEGIN
    CREATE DATABASE ProductDB;
END
GO

USE ProductDB;
GO

-- =============================================
-- 1. BẢNG DANH MỤC (Categories)
-- =============================================
IF OBJECT_ID('Categories', 'U') IS NOT NULL
    DROP TABLE Categories;
GO

CREATE TABLE Categories (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(500),
    image NVARCHAR(500),
    isActive BIT DEFAULT 1,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);
GO

-- =============================================
-- 2. BẢNG THƯƠNG HIỆU (Brands)
-- =============================================
IF OBJECT_ID('Brands', 'U') IS NOT NULL
    DROP TABLE Brands;
GO

CREATE TABLE Brands (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(500),
    logo NVARCHAR(500),
    website NVARCHAR(500),
    isActive BIT DEFAULT 1,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);
GO

-- =============================================
-- 3. BẢNG SẢN PHẨM (Products)
-- =============================================
IF OBJECT_ID('Products', 'U') IS NOT NULL
    DROP TABLE Products;
GO

CREATE TABLE Products (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(200) NOT NULL,
    sku NVARCHAR(50) UNIQUE, -- Mã sản phẩm
    priceValue DECIMAL(18,2) NOT NULL, -- Giá trị số
    price NVARCHAR(50), -- Giá hiển thị (ví dụ: "1.500.000₫")
    categoryId INT NOT NULL,
    brandId INT NOT NULL,
    image NVARCHAR(500), -- Hình ảnh chính
    description NVARCHAR(MAX), -- Mô tả chi tiết
    shortDescription NVARCHAR(500), -- Mô tả ngắn
    stock INT DEFAULT 0, -- Số lượng tồn kho
    weight DECIMAL(10,2), -- Trọng lượng (kg)
    dimensions NVARCHAR(100), -- Kích thước
    vat NVARCHAR(20), -- VAT tag
    ship NVARCHAR(20), -- SHIP tag
    isActive BIT DEFAULT 1,
    isFeatured BIT DEFAULT 0, -- Sản phẩm nổi bật
    viewCount INT DEFAULT 0, -- Số lượt xem
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    
    -- Foreign Keys
    CONSTRAINT FK_Products_Category FOREIGN KEY (categoryId) REFERENCES Categories(id),
    CONSTRAINT FK_Products_Brand FOREIGN KEY (brandId) REFERENCES Brands(id)
);
GO

-- Create Indexes for Products
CREATE INDEX IX_Products_Category ON Products(categoryId);
CREATE INDEX IX_Products_Brand ON Products(brandId);
CREATE INDEX IX_Products_Price ON Products(priceValue);
CREATE INDEX IX_Products_Active ON Products(isActive);
GO

-- =============================================
-- 4. BẢNG HÌNH ẢNH SẢN PHẨM (ProductImages)
-- =============================================
IF OBJECT_ID('ProductImages', 'U') IS NOT NULL
    DROP TABLE ProductImages;
GO

CREATE TABLE ProductImages (
    id INT PRIMARY KEY IDENTITY(1,1),
    productId INT NOT NULL,
    imageUrl NVARCHAR(500) NOT NULL,
    altText NVARCHAR(200),
    displayOrder INT DEFAULT 0, -- Thứ tự hiển thị
    isPrimary BIT DEFAULT 0, -- Hình ảnh chính
    createdAt DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT FK_ProductImages_Product FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_ProductImages_Product ON ProductImages(productId);
GO

-- =============================================
-- 5. BẢNG THÔNG SỐ KỸ THUẬT (ProductSpecifications)
-- =============================================
IF OBJECT_ID('ProductSpecifications', 'U') IS NOT NULL
    DROP TABLE ProductSpecifications;
GO

CREATE TABLE ProductSpecifications (
    id INT PRIMARY KEY IDENTITY(1,1),
    productId INT NOT NULL,
    label NVARCHAR(200) NOT NULL,
    value NVARCHAR(500) NOT NULL,
    displayOrder INT DEFAULT 0,
    createdAt DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT FK_ProductSpecifications_Product FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_ProductSpecifications_Product ON ProductSpecifications(productId);
GO

-- =============================================
-- 6. BẢNG KHÁCH HÀNG (Customers)
-- =============================================
IF OBJECT_ID('Customers', 'U') IS NOT NULL
    DROP TABLE Customers;
GO

CREATE TABLE Customers (
    id INT PRIMARY KEY IDENTITY(1,1),
    email NVARCHAR(100) NOT NULL UNIQUE,
    phone NVARCHAR(20),
    fullName NVARCHAR(100),
    address NVARCHAR(500),
    city NVARCHAR(100),
    district NVARCHAR(100),
    ward NVARCHAR(100),
    isActive BIT DEFAULT 1,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);
GO

-- =============================================
-- 7. BẢNG ĐƠN HÀNG (Orders)
-- =============================================
IF OBJECT_ID('Orders', 'U') IS NOT NULL
    DROP TABLE Orders;
GO

CREATE TABLE Orders (
    id INT PRIMARY KEY IDENTITY(1,1),
    orderNumber NVARCHAR(50) UNIQUE NOT NULL,
    customerId INT,
    totalAmount DECIMAL(18,2) NOT NULL,
    shippingFee DECIMAL(18,2) DEFAULT 0,
    discount DECIMAL(18,2) DEFAULT 0,
    finalAmount DECIMAL(18,2) NOT NULL,
    status NVARCHAR(50) DEFAULT 'pending', -- pending, confirmed, shipping, delivered, cancelled
    paymentMethod NVARCHAR(50),
    paymentStatus NVARCHAR(50) DEFAULT 'unpaid', -- unpaid, paid, refunded
    shippingAddress NVARCHAR(500),
    notes NVARCHAR(1000),
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT FK_Orders_Customer FOREIGN KEY (customerId) REFERENCES Customers(id)
);
GO

CREATE INDEX IX_Orders_Customer ON Orders(customerId);
CREATE INDEX IX_Orders_Status ON Orders(status);
CREATE INDEX IX_Orders_CreatedAt ON Orders(createdAt);
GO

-- =============================================
-- 8. BẢNG CHI TIẾT ĐƠN HÀNG (OrderItems)
-- =============================================
IF OBJECT_ID('OrderItems', 'U') IS NOT NULL
    DROP TABLE OrderItems;
GO

CREATE TABLE OrderItems (
    id INT PRIMARY KEY IDENTITY(1,1),
    orderId INT NOT NULL,
    productId INT NOT NULL,
    quantity INT NOT NULL,
    unitPrice DECIMAL(18,2) NOT NULL, -- Giá tại thời điểm mua
    totalPrice DECIMAL(18,2) NOT NULL, -- quantity * unitPrice
    createdAt DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT FK_OrderItems_Order FOREIGN KEY (orderId) REFERENCES Orders(id) ON DELETE CASCADE,
    CONSTRAINT FK_OrderItems_Product FOREIGN KEY (productId) REFERENCES Products(id)
);
GO

CREATE INDEX IX_OrderItems_Order ON OrderItems(orderId);
CREATE INDEX IX_OrderItems_Product ON OrderItems(productId);
GO

-- =============================================
-- 9. BẢNG ĐÁNH GIÁ SẢN PHẨM (ProductReviews)
-- =============================================
IF OBJECT_ID('ProductReviews', 'U') IS NOT NULL
    DROP TABLE ProductReviews;
GO

CREATE TABLE ProductReviews (
    id INT PRIMARY KEY IDENTITY(1,1),
    productId INT NOT NULL,
    customerId INT,
    rating INT NOT NULL,
    title NVARCHAR(200),
    comment NVARCHAR(1000),
    isApproved BIT DEFAULT 0,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT FK_ProductReviews_Product FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE,
    CONSTRAINT FK_ProductReviews_Customer FOREIGN KEY (customerId) REFERENCES Customers(id),
    CONSTRAINT CK_ProductReviews_Rating CHECK (rating >= 1 AND rating <= 5)
);
GO

CREATE INDEX IX_ProductReviews_Product ON ProductReviews(productId);
CREATE INDEX IX_ProductReviews_Customer ON ProductReviews(customerId);
GO

-- =============================================
-- 10. BẢNG GIẢM GIÁ/KHUYẾN MÃI (Promotions)
-- =============================================
IF OBJECT_ID('Promotions', 'U') IS NOT NULL
    DROP TABLE Promotions;
GO

CREATE TABLE Promotions (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(200) NOT NULL,
    description NVARCHAR(500),
    discountType NVARCHAR(20) NOT NULL, -- percentage, fixed
    discountValue DECIMAL(18,2) NOT NULL,
    startDate DATETIME NOT NULL,
    endDate DATETIME NOT NULL,
    minPurchaseAmount DECIMAL(18,2),
    maxDiscountAmount DECIMAL(18,2),
    isActive BIT DEFAULT 1,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);
GO

CREATE INDEX IX_Promotions_Dates ON Promotions(startDate, endDate);
GO

-- =============================================
-- 11. BẢNG LIÊN KẾT SẢN PHẨM - KHUYẾN MÃI (ProductPromotions)
-- =============================================
IF OBJECT_ID('ProductPromotions', 'U') IS NOT NULL
    DROP TABLE ProductPromotions;
GO

CREATE TABLE ProductPromotions (
    id INT PRIMARY KEY IDENTITY(1,1),
    productId INT NOT NULL,
    promotionId INT NOT NULL,
    createdAt DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT FK_ProductPromotions_Product FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE,
    CONSTRAINT FK_ProductPromotions_Promotion FOREIGN KEY (promotionId) REFERENCES Promotions(id) ON DELETE CASCADE,
    CONSTRAINT UK_ProductPromotions UNIQUE (productId, promotionId)
);
GO

-- =============================================
-- INSERT DỮ LIỆU MẪU
-- =============================================

-- Insert Categories
INSERT INTO Categories (name, description) VALUES
(N'Điện tử', N'Các sản phẩm điện tử, công nghệ'),
(N'Thời trang', N'Quần áo, phụ kiện thời trang'),
(N'Gia dụng', N'Đồ dùng gia đình, nội thất'),
(N'Thể thao', N'Đồ thể thao, dụng cụ tập luyện'),
(N'Sách', N'Sách vở, tài liệu');

-- Insert Brands
INSERT INTO Brands (name, description) VALUES
(N'Brand A', N'Thương hiệu A - Chất lượng cao'),
(N'Brand B', N'Thương hiệu B - Giá cả hợp lý'),
(N'Brand C', N'Thương hiệu C - Thiết kế hiện đại'),
(N'Brand D', N'Thương hiệu D - Độ bền cao'),
(N'Brand E', N'Thương hiệu E - Thân thiện môi trường');

-- Insert Sample Products
DECLARE @categoryId1 INT = (SELECT id FROM Categories WHERE name = N'Điện tử');
DECLARE @categoryId2 INT = (SELECT id FROM Categories WHERE name = N'Thời trang');
DECLARE @categoryId3 INT = (SELECT id FROM Categories WHERE name = N'Gia dụng');
DECLARE @categoryId4 INT = (SELECT id FROM Categories WHERE name = N'Thể thao');
DECLARE @categoryId5 INT = (SELECT id FROM Categories WHERE name = N'Sách');

DECLARE @brandId1 INT = (SELECT id FROM Brands WHERE name = N'Brand A');
DECLARE @brandId2 INT = (SELECT id FROM Brands WHERE name = N'Brand B');
DECLARE @brandId3 INT = (SELECT id FROM Brands WHERE name = N'Brand C');
DECLARE @brandId4 INT = (SELECT id FROM Brands WHERE name = N'Brand D');
DECLARE @brandId5 INT = (SELECT id FROM Brands WHERE name = N'Brand E');

-- Insert 10 sample products
INSERT INTO Products (name, sku, priceValue, price, categoryId, brandId, image, description, stock, vat, ship, isFeatured)
VALUES
(N'Sản phẩm 1', 'SP001', 1500000, N'1.500.000₫', @categoryId1, @brandId1, 'https://picsum.photos/id/1/400/300', N'Mô tả sản phẩm 1', 50, 'VAT', 'SHIP', 1),
(N'Sản phẩm 2', 'SP002', 1200000, N'1.200.000₫', @categoryId2, @brandId2, 'https://picsum.photos/id/2/400/300', N'Mô tả sản phẩm 2', 30, NULL, 'SHIP', 0),
(N'Sản phẩm 3', 'SP003', 800000, N'800.000₫', @categoryId3, @brandId3, 'https://picsum.photos/id/3/400/300', N'Mô tả sản phẩm 3', 100, 'VAT', NULL, 1),
(N'Sản phẩm 4', 'SP004', 2000000, N'2.000.000₫', @categoryId4, @brandId4, 'https://picsum.photos/id/4/400/300', N'Mô tả sản phẩm 4', 25, NULL, 'SHIP', 0),
(N'Sản phẩm 5', 'SP005', 600000, N'600.000₫', @categoryId5, @brandId5, 'https://picsum.photos/id/5/400/300', N'Mô tả sản phẩm 5', 75, 'VAT', NULL, 1),
(N'Sản phẩm 6', 'SP006', 1800000, N'1.800.000₫', @categoryId1, @brandId1, 'https://picsum.photos/id/6/400/300', N'Mô tả sản phẩm 6', 40, NULL, 'SHIP', 0),
(N'Sản phẩm 7', 'SP007', 950000, N'950.000₫', @categoryId2, @brandId2, 'https://picsum.photos/id/7/400/300', N'Mô tả sản phẩm 7', 60, 'VAT', 'SHIP', 1),
(N'Sản phẩm 8', 'SP008', 1300000, N'1.300.000₫', @categoryId3, @brandId3, 'https://picsum.photos/id/8/400/300', N'Mô tả sản phẩm 8', 35, NULL, NULL, 0),
(N'Sản phẩm 9', 'SP009', 1100000, N'1.100.000₫', @categoryId4, @brandId4, 'https://picsum.photos/id/9/400/300', N'Mô tả sản phẩm 9', 80, 'VAT', 'SHIP', 1),
(N'Sản phẩm 10', 'SP010', 750000, N'750.000₫', @categoryId5, @brandId5, 'https://picsum.photos/id/10/400/300', N'Mô tả sản phẩm 10', 45, NULL, NULL, 0);

-- Insert Product Images for first product
DECLARE @productId1 INT = (SELECT id FROM Products WHERE sku = 'SP001');
INSERT INTO ProductImages (productId, imageUrl, displayOrder, isPrimary) VALUES
(@productId1, 'https://picsum.photos/id/1/400/300', 1, 1),
(@productId1, 'https://picsum.photos/id/11/400/300', 2, 0),
(@productId1, 'https://picsum.photos/id/21/400/300', 3, 0),
(@productId1, 'https://picsum.photos/id/31/400/300', 4, 0);

-- Insert Product Specifications for first product
INSERT INTO ProductSpecifications (productId, label, value, displayOrder) VALUES
(@productId1, N'Thương hiệu', N'Brand A', 1),
(@productId1, N'Mã sản phẩm', N'SP001', 2),
(@productId1, N'Trọng lượng', N'1.5 kg', 3),
(@productId1, N'Kích thước', N'20 x 15 x 10 cm', 4);

GO

-- =============================================
-- TẠO VIEWS HỮU ÍCH
-- =============================================

-- View: ProductDetails - Lấy thông tin đầy đủ sản phẩm
IF OBJECT_ID('vw_ProductDetails', 'V') IS NOT NULL
    DROP VIEW vw_ProductDetails;
GO

CREATE VIEW vw_ProductDetails AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.priceValue,
    p.price,
    p.image,
    p.description,
    p.stock,
    p.vat,
    p.ship,
    p.isFeatured,
    p.viewCount,
    c.name AS categoryName,
    c.id AS categoryId,
    b.name AS brandName,
    b.id AS brandId,
    p.createdAt,
    p.updatedAt
FROM Products p
INNER JOIN Categories c ON p.categoryId = c.id
INNER JOIN Brands b ON p.brandId = b.id
WHERE p.isActive = 1;
GO

-- View: ProductWithImages - Sản phẩm kèm danh sách hình ảnh
IF OBJECT_ID('vw_ProductWithImages', 'V') IS NOT NULL
    DROP VIEW vw_ProductWithImages;
GO

CREATE VIEW vw_ProductWithImages AS
SELECT 
    p.id,
    p.name,
    p.priceValue,
    p.price,
    p.image AS primaryImage,
    (
        SELECT imageUrl 
        FROM ProductImages 
        WHERE productId = p.id 
        ORDER BY displayOrder
        FOR JSON PATH
    ) AS images
FROM Products p
WHERE p.isActive = 1;
GO

-- =============================================
-- TẠO STORED PROCEDURES
-- =============================================

-- Stored Procedure: Get Products by Category
IF OBJECT_ID('sp_GetProductsByCategory', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetProductsByCategory;
GO

CREATE PROCEDURE sp_GetProductsByCategory
    @categoryId INT,
    @page INT = 1,
    @pageSize INT = 12
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @offset INT = (@page - 1) * @pageSize;
    
    -- Get total count
    SELECT COUNT(*) AS total
    FROM Products
    WHERE categoryId = @categoryId AND isActive = 1;
    
    -- Get products
    SELECT 
        p.id,
        p.name,
        p.priceValue,
        p.price,
        p.image,
        p.categoryId,
        p.brandId,
        c.name AS categoryName,
        b.name AS brandName
    FROM Products p
    INNER JOIN Categories c ON p.categoryId = c.id
    INNER JOIN Brands b ON p.brandId = b.id
    WHERE p.categoryId = @categoryId AND p.isActive = 1
    ORDER BY p.id
    OFFSET @offset ROWS
    FETCH NEXT @pageSize ROWS ONLY;
END
GO

-- Stored Procedure: Get Products by Price Range
IF OBJECT_ID('sp_GetProductsByPriceRange', 'P') IS NOT NULL
    DROP PROCEDURE sp_GetProductsByPriceRange;
GO

CREATE PROCEDURE sp_GetProductsByPriceRange
    @minPrice DECIMAL(18,2) = NULL,
    @maxPrice DECIMAL(18,2) = NULL,
    @page INT = 1,
    @pageSize INT = 12,
    @sortBy NVARCHAR(20) = 'price_asc'
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @offset INT = (@page - 1) * @pageSize;
    DECLARE @orderBy NVARCHAR(100);
    
    SET @orderBy = CASE @sortBy
        WHEN 'price_asc' THEN 'p.priceValue ASC'
        WHEN 'price_desc' THEN 'p.priceValue DESC'
        WHEN 'name_asc' THEN 'p.name ASC'
        WHEN 'name_desc' THEN 'p.name DESC'
        ELSE 'p.priceValue ASC'
    END;
    
    -- Get total count
    SELECT COUNT(*) AS total
    FROM Products p
    WHERE p.isActive = 1
        AND (@minPrice IS NULL OR p.priceValue >= @minPrice)
        AND (@maxPrice IS NULL OR p.priceValue <= @maxPrice);
    
    -- Get products
    DECLARE @sql NVARCHAR(MAX) = N'
    SELECT 
        p.id,
        p.name,
        p.priceValue,
        p.price,
        p.image,
        p.categoryId,
        p.brandId,
        c.name AS categoryName,
        b.name AS brandName
    FROM Products p
    INNER JOIN Categories c ON p.categoryId = c.id
    INNER JOIN Brands b ON p.brandId = b.id
    WHERE p.isActive = 1
        AND (@minPrice IS NULL OR p.priceValue >= @minPrice)
        AND (@maxPrice IS NULL OR p.priceValue <= @maxPrice)
    ORDER BY ' + @orderBy + '
    OFFSET @offset ROWS
    FETCH NEXT @pageSize ROWS ONLY;';
    
    EXEC sp_executesql @sql, 
        N'@minPrice DECIMAL(18,2), @maxPrice DECIMAL(18,2), @offset INT, @pageSize INT',
        @minPrice, @maxPrice, @offset, @pageSize;
END
GO

PRINT '✅ Database schema đã được tạo thành công!';
PRINT '✅ Dữ liệu mẫu đã được chèn vào database!';
PRINT '✅ Views và Stored Procedures đã được tạo!';


# 📸 Hệ Thống Upload Ảnh Sản Phẩm

Hệ thống upload ảnh sản phẩm cho phép quản lý nhiều ảnh với phân biệt ảnh chính (primary) và ảnh phụ (secondary).

## ✨ Tính Năng

✅ **Upload Nhiều Ảnh** - Upload tối đa 10+ ảnh cùng lúc  
✅ **Phân Biệt Ảnh Chính/Phụ** - Mỗi sản phẩm có 1 ảnh chính + nhiều ảnh phụ  
✅ **Thay Đổi Thứ Tự** - Sắp xếp ảnh theo thứ tự mong muốn  
✅ **Cập Nhật altText** - Thêm mô tả cho mỗi ảnh (SEO friendly)  
✅ **Xóa Ảnh** - Xóa ảnh không cần thiết từ Cloudinary  
✅ **Xem Trước** - Preview ảnh trước khi upload  
✅ **Tự Động Tối Ưu** - Tự động resize và optimize ảnh trên Cloudinary  

## 🏗️ Cấu Trúc Dữ Liệu

### ProductImage Collection

```typescript
interface ProductImage {
  _id: ObjectId;
  productId: string;              // ID của sản phẩm
  cloudinaryPublicId: string;     // Public ID trên Cloudinary
  imageUrl: string;               // URL đầy đủ của ảnh
  altText?: string;               // Văn bản thay thế (SEO)
  displayOrder: number;           // Thứ tự hiển thị (0, 1, 2...)
  isPrimary: boolean;             // true = ảnh chính, false = ảnh phụ
  width?: number;                 // Chiều rộng ảnh
  height?: number;                // Chiều cao ảnh
  bytes?: number;                 // Kích thước file
  format?: string;                // Format ảnh (jpeg, png, webp...)
  uploadedAt: Date;               // Ngày upload lên Cloudinary
  createdAt: Date;                // Ngày tạo record trong DB
}
```

### Product Schema (Cập Nhật)

```typescript
interface Product {
  // ... fields khác
  primaryImageId?: string;        // ID của ProductImage (ảnh chính)
  image?: string;                 // (Deprecated) dùng primaryImageId
  images?: string[];              // (Deprecated) dùng productImages collection
}
```

## 🚀 Cách Sử Dụng

### 1. Upload Ảnh (Frontend)

#### Dùng Component ProductImageUpload

```tsx
import ProductImageUpload from '@/components/ProductImageUpload';

export default function AdminProductPage() {
  const productId = '...'; // ID sản phẩm từ params

  return (
    <ProductImageUpload 
      productId={productId}
      onUploadComplete={(images) => {
        console.log('Upload thành công:', images);
        // Refresh danh sách ảnh
      }}
      onError={(error) => {
        console.error('Lỗi upload:', error);
      }}
    />
  );
}
```

#### Upload Manual

```typescript
// Upload 1 ảnh chính
const formData = new FormData();
formData.append('files', imageFile);
formData.append('isPrimary', 'true');

const response = await fetch(`/api/admin/products/${productId}/images`, {
  method: 'POST',
  body: formData,
});

const data = await response.json();
console.log('Ảnh upload:', data.data);
```

### 2. Hiển Thị Ảnh (Frontend)

#### Dùng Component ProductImageGallery

```tsx
import ProductImageGallery from '@/components/ProductImageGallery';

export default function ProductDetail() {
  const [images, setImages] = useState<ProductImage[]>([]);

  useEffect(() => {
    // Fetch ảnh từ API
    fetchProductImages();
  }, []);

  return (
    <ProductImageGallery 
      productId={productId}
      images={images}
      isAdmin={true}
      onSetPrimary={(imageId) => {
        // Cập nhật ảnh chính
        setImages(prev => prev.map(img => ({
          ...img,
          isPrimary: img._id === imageId,
        })));
      }}
      onDeleteImage={(imageId) => {
        // Xóa ảnh khỏi danh sách
        setImages(prev => prev.filter(img => img._id !== imageId));
      }}
    />
  );
}
```

### 3. API Endpoints

#### POST /api/admin/products/[id]/images
**Upload ảnh cho sản phẩm**

```bash
curl -X POST http://localhost:3000/api/admin/products/123/images \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg" \
  -F "isPrimary=true" \
  -F "isPrimary=false"
```

**Response:**
```json
{
  "success": true,
  "message": "Đã upload 2 ảnh thành công",
  "data": [
    {
      "_id": "...",
      "productId": "123",
      "imageUrl": "https://...",
      "isPrimary": true,
      "displayOrder": 0
    }
  ]
}
```

#### PATCH /api/admin/products/images/[imageId]
**Cập nhật ảnh**

```bash
# Đặt ảnh chính
curl -X PATCH http://localhost:3000/api/admin/products/images/123 \
  -H "Content-Type: application/json" \
  -d '{"isPrimary": true}'

# Cập nhật thứ tự
curl -X PATCH http://localhost:3000/api/admin/products/images/123 \
  -H "Content-Type: application/json" \
  -d '{"displayOrder": 2}'

# Cập nhật altText
curl -X PATCH http://localhost:3000/api/admin/products/images/123 \
  -H "Content-Type: application/json" \
  -d '{"altText": "Ảnh mặt trước sản phẩm"}'
```

#### DELETE /api/admin/products/images/[imageId]
**Xóa ảnh**

```bash
curl -X DELETE http://localhost:3000/api/admin/products/images/123
```

## 💻 Service Functions (Backend)

### ImageService.ts

```typescript
// Upload ảnh
import {
  uploadPrimaryProductImage,      // Upload ảnh chính
  uploadAdditionalProductImage,   // Upload ảnh phụ
  uploadMultipleImages,           // Upload nhiều ảnh cùng lúc
} from '@/Service/ImageService';

// Lấy ảnh
import {
  getProductImages,               // Lấy tất cả ảnh
  getPrimaryProductImage,         // Lấy ảnh chính
  getSecondaryProductImages,      // Lấy ảnh phụ
} from '@/Service/ImageService';

// Cập nhật
import {
  setPrimaryImage,                // Đặt ảnh chính
  updateImageDisplayOrder,        // Thay đổi thứ tự
  updateImageAltText,             // Cập nhật altText
} from '@/Service/ImageService';

// Xóa
import {
  deleteProductImage,             // Xóa 1 ảnh
  deleteAllProductImages,         // Xóa tất cả ảnh
} from '@/Service/ImageService';
```

### AdminService.ts

```typescript
// Các hàm tương tự cũng có trong AdminService
import {
  getProductImages,
  getPrimaryProductImage,
  updateImageDisplayOrder,
  setPrimaryImage,
  updateImageAltText,
  deleteProductImage,
  deleteAllProductImages,
} from '@/Service/AdminService';
```

## 📝 Ví Dụ Sử Dụng Đầy Đủ

### Backend - Upload Ảnh

```typescript
import { uploadPrimaryProductImage, uploadAdditionalProductImage } from '@/Service/ImageService';

async function setupProductImages(productId: string, files: Buffer[]) {
  try {
    // Upload ảnh chính (ảnh đầu tiên)
    const primaryImage = await uploadPrimaryProductImage(
      files[0],
      productId,
      'Ảnh mặt trước sản phẩm'
    );

    console.log('✅ Ảnh chính:', primaryImage);

    // Upload ảnh phụ (các ảnh còn lại)
    if (files.length > 1) {
      for (let i = 1; i < files.length; i++) {
        const secondaryImage = await uploadAdditionalProductImage(
          files[i],
          productId,
          `Ảnh mặt ${i + 1}`
        );
        console.log(`✅ Ảnh phụ ${i}:`, secondaryImage);
      }
    }
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}
```

### Backend - Lấy Ảnh

```typescript
import { getProductImages, getPrimaryProductImage } from '@/Service/ImageService';

async function displayProductImages(productId: string) {
  // Lấy ảnh chính
  const primaryImage = await getPrimaryProductImage(productId);
  console.log('Ảnh chính:', primaryImage?.imageUrl);

  // Lấy tất cả ảnh
  const allImages = await getProductImages(productId);
  console.log('Số ảnh:', allImages.length);
  
  // Hiển thị ảnh đầu tiên
  console.log('Ảnh 1:', allImages[0]?.imageUrl);
}
```

### Backend - Cập Nhật Ảnh

```typescript
import { setPrimaryImage, updateImageDisplayOrder } from '@/Service/ImageService';

async function rearrangeImages(imageIds: string[]) {
  // Đặt ảnh đầu tiên làm ảnh chính
  await setPrimaryImage(imageIds[0]);

  // Cập nhật thứ tự ảnh
  for (let i = 0; i < imageIds.length; i++) {
    await updateImageDisplayOrder(imageIds[i], i);
  }
  
  console.log('✅ Đã sắp xếp ảnh');
}
```

## 🔧 Cấu Hình Cloudinary

Đảm bảo các biến môi trường trong `.env.local`:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Mỗi sản phẩm sẽ có folder riêng: `products/{productId}`

## 🎨 Tối Ưu Hóa Ảnh

Cloudinary tự động tối ưu ảnh với:

- **Auto Format** - Chọn format tốt nhất (webp, jpeg, png)
- **Auto Quality** - Nén ảnh tự động
- **Responsive** - Cung cấp ảnh ở nhiều kích thước
- **CDN Global** - Tải nhanh ở khắp nơi

```typescript
// Lấy URL ảnh với transformation
const url = getImageUrl('products/123/abc', {
  width: 400,
  height: 400,
  crop: 'fill',
  quality: 'auto',
  format: 'auto',
});
// Result: https://...cloudinary.com/.../w_400,h_400,c_fill,q_auto,f_auto/...
```

## 🚨 Xử Lý Lỗi

Tất cả service functions đều có try-catch:

```typescript
try {
  const image = await uploadPrimaryProductImage(file, productId);
} catch (error) {
  if (error instanceof Error) {
    console.error('Lỗi:', error.message);
  }
}
```

## 📊 Database Queries

```javascript
// Lấy sản phẩm với ảnh
db.products.aggregate([
  {
    $lookup: {
      from: "productImages",
      localField: "_id",
      foreignField: "productId",
      as: "images"
    }
  },
  {
    $addFields: {
      primaryImage: {
        $arrayElemAt: [
          { $filter: { input: "$images", as: "img", cond: { $eq: ["$$img.isPrimary", true] } } },
          0
        ]
      }
    }
  }
]);

// Lấy tất cả ảnh của sản phẩm (sắp xếp theo thứ tự)
db.productImages.find({ productId: "123" }).sort({ displayOrder: 1 })
```

## 🎯 Best Practices

1. **Ảnh Chính** - Luôn có 1 ảnh chính, nếu xóa sẽ tự động chọn ảnh tiếp theo
2. **ALT Text** - Luôn thêm altText cho SEO
3. **Kích Thước** - Để Cloudinary xử lý, không cần resize local
4. **Thứ Tự** - Sắp xếp ảnh theo thứ tự logic (mặt trước, mặt sau, chi tiết...)
5. **Format** - Hỗ trợ JPEG, PNG, WebP, GIF, BMP

## ⚡ Performance

- Ảnh được cache bởi Cloudinary CDN
- Tối ưu tự động cho mỗi device
- Lazy loading cho thumbnail
- Progressive image loading

## 📱 Responsive

Components tự động responsive trên:
- Mobile (< 768px)
- Tablet (768px - 1024px)
- Desktop (> 1024px)

---

**Liên hệ**: Nếu có vấn đề, kiểm tra logs hoặc Cloudinary dashboard.

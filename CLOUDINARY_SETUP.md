# 🔧 Hướng dẫn cấu hình Cloudinary

## ✅ Đã cấu hình

- **API Key**: `181842978594252`
- **API Secret**: `miFBdov6SZlnOqYF8W2X4khuMU`

## ⚠️ Cần bổ sung

Bạn cần thêm **Cloud Name** vào file `.env.local`:

1. Đăng nhập vào Cloudinary Dashboard: https://cloudinary.com/console
2. Vào **Settings** → **Product environment credentials**
3. Tìm **Cloud name** (thường là tên bạn đặt khi tạo account)
4. Cập nhật trong `.env.local`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=181842978594252
CLOUDINARY_API_SECRET=miFBdov6SZlnOqYF8W2X4khuMU
```

## 📁 Cấu trúc đường dẫn

Khi upload ảnh, đường dẫn sẽ là:
```
products/{productId}/image.jpg
```

Ví dụ:
- Product ID: `507f1f77bcf86cd799439011`
- Đường dẫn: `products/507f1f77bcf86cd799439011/image.jpg`

## 🧪 Test upload

Sau khi cấu hình xong, bạn có thể:
1. Truy cập `/admin`
2. Tạo/sửa sản phẩm
3. Upload ảnh
4. Ảnh sẽ được lưu vào `products/{productId}/` trên Cloudinary

## 🔐 Bảo mật

- ⚠️ **KHÔNG** commit file `.env.local` lên Git
- ⚠️ File `.env.local` đã có trong `.gitignore`
- ✅ API Secret được bảo mật trong environment variables



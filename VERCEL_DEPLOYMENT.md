# Hướng dẫn Deploy lên Vercel

## Problem: "Topology is closed" Error (500 Internal Server Error)

Lỗi này xảy ra trên Vercel vì:
- Vercel dùng serverless functions với timeout 10-60 giây
- Mỗi request có thể tạo connection instance mới
- IP của Vercel không được whitelist trên MongoDB Atlas

## ✅ Solutions Applied

### 1. Connection Pooling Configuration
Đã cấu hình trong `src/DataBase/mongodb.connection.ts`:
- `maxPoolSize: 5` (tối đa 5 connections)
- `minPoolSize: 1` (giữ 1 connection sẵn sàng)
- `maxIdleTimeMS: 60000` (giữ connection sống 60 giây)
- `serverSelectionTimeoutMS: 15000` (timeout 15 giây)
- **Auto reconnect** khi "Topology is closed"

### 2. ⚠️ REQUIRED: MongoDB Atlas IP Whitelist

**MOST IMPORTANT STEP!** Vercel dùng dynamic IP addresses. Phải thêm 0.0.0.0/0:

1. Vào [MongoDB Atlas Network Access](https://cloud.mongodb.com/v2#/org/security/networkAccess)
2. Nhấp "ADD IP ADDRESS"
3. Chọn "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0)
   - ✅ Cho phép connections từ bất kỳ IP nào (bao gồm Vercel)
4. Click "Confirm"

**Nếu không whitelisting, Vercel sẽ nhận lỗi:**
```
ETIMEOUT - connection timeout
Error: connect ETIMEDOUT
```

## 1. Cấu hình Environment Variables trên Vercel

Trên dashboard Vercel, vào Settings → Environment Variables và thêm các biến sau:

### MongoDB Configuration (REQUIRED)
```
MONGODB_URI=mongodb+srv://repins:a9burfi2qtlEb9DZ@cluster0.sdcul4j.mongodb.net/repins?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DATABASE=repins
```

### Cloudinary Configuration (REQUIRED)
```
CLOUDINARY_CLOUD_NAME=repins
CLOUDINARY_API_KEY=181842978594252
CLOUDINARY_API_SECRET=-miFBdov6SZlnOqYF8W2X4khuMU
```

## 2. Cấu hình MongoDB Atlas IP Whitelist

**IMPORTANT**: MongoDB Atlas cần cho phép Vercel truy cập.

1. Đăng nhập MongoDB Atlas: https://cloud.mongodb.com
2. Vào Network Access (Security → Network Access)
3. Thêm IP Address:
   - Thêm `0.0.0.0/0` (allow all IPs - cho Vercel serverless functions)
   - HOẶC thêm từng IP của Vercel (nếu có thể)

## 3. Troubleshooting "Topology is closed" Error

Lỗi này xảy ra khi MongoDB connection bị đóng trên Vercel serverless environment.

### Giải pháp đã áp dụng:
- ✅ Thêm connection health check
- ✅ Tự động reconnect khi topology closed
- ✅ Tăng timeout từ 10s → 15s
- ✅ Giảm pool size cho serverless (5 max, 1 min)
- ✅ Thêm retry logic

### Nếu vẫn lỗi, kiểm tra:

1. **MongoDB Atlas Network Access**
   - Đảm bảo Vercel IPs được whitelist
   - Nên sử dụng `0.0.0.0/0` cho development/testing

2. **Connection String Format**
   - Phải có tên database: `/repins?`
   - Phải có parameters: `retryWrites=true&w=majority`
   - Password không được chứa special characters (hoặc phải URL encode)

3. **Environment Variables**
   - Đảm bảo tất cả env vars đúng trên Vercel dashboard
   - Sau khi update env vars, cần redeploy

## 4. Test API trước deploy

```bash
# Test locally
npm run dev

# Test API
curl https://repins.vercel.app/api/categories
curl https://repins.vercel.app/api/products
curl https://repins.vercel.app/api/brands
```

## 5. Logs trên Vercel

- Xem logs: Vercel Dashboard → Deployments → Click deployment → Functions tab
- Hoặc: `vercel logs <app-name>`

## 6. Redeploy sau khi thay đổi

```bash
# Push code
git push

# Vercel sẽ tự động deploy, hoặc
vercel --prod
```

## Lưu ý quan trọng

- **KHÔNG** commit `.env.local` lên GitHub (thêm vào `.gitignore`)
- Environment variables trên Vercel độc lập với `.env.local` local
- Vercel serverless functions có timeout ~30s, nên hạn chế các operation lâu
- MongoDB connection pooling được tối ưu cho serverless (minPoolSize: 1, maxPoolSize: 5)

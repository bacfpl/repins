# 🔧 Hướng dẫn khắc phục lỗi kết nối MongoDB

## ❌ Lỗi hiện tại: `authentication failed` (Code: 8000)

Lỗi này xảy ra khi MongoDB không thể xác thực username/password của bạn.

## 🔍 Các nguyên nhân phổ biến:

### 1. **Password không đúng**
- Password trong `.env.local` có thể không khớp với password trong MongoDB Atlas
- Password có thể đã bị thay đổi

**Cách khắc phục:**
1. Vào MongoDB Atlas → Database Access
2. Tìm user `xuanbacliliana`
3. Click "Edit" → "Edit Password"
4. Tạo password mới (lưu ý: copy password ngay vì không xem lại được)
5. Cập nhật password trong `.env.local`

### 2. **Password chứa ký tự đặc biệt cần encode**
Nếu password chứa các ký tự: `@`, `:`, `/`, `#`, `?`, `[`, `]`
→ Cần URL encode trong connection string

**Ví dụ:**
- Password: `p@ssw:rd` 
- Cần encode thành: `p%40ssw%3Ard`

**Cách encode:**
- Sử dụng: https://www.urlencoder.org/
- Hoặc đổi password không có ký tự đặc biệt

### 3. **User không có quyền truy cập**
- User có thể không có quyền read/write trên database

**Cách khắc phục:**
1. Vào MongoDB Atlas → Database Access
2. Tìm user `xuanbacliliana`
3. Click "Edit"
4. Trong "Database User Privileges", chọn:
   - "Atlas admin" (cho full access)
   - Hoặc "Read and write to any database" (cho development)

### 4. **Network Access chưa được cấu hình**
- IP của bạn chưa được whitelist trong MongoDB Atlas

**Cách khắc phục:**
1. Vào MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Chọn một trong:
   - **"Add Current IP Address"** (khuyến nghị)
   - **"Allow Access from Anywhere"** (`0.0.0.0/0`) - chỉ dùng cho dev
4. Click "Confirm"

### 5. **Connection string không đúng format**

**Format đúng:**
```
mongodb+srv://username:password@cluster.mongodb.net/database?options
```

**Kiểm tra:**
- ✅ Có `mongodb+srv://` ở đầu
- ✅ Có `username:password@` sau protocol
- ✅ Có `@` giữa credentials và host
- ✅ Không có khoảng trắng
- ✅ Password không có ký tự đặc biệt chưa encode

## 🛠️ Các bước khắc phục chi tiết:

### Bước 1: Kiểm tra và reset password

1. Đăng nhập MongoDB Atlas: https://cloud.mongodb.com
2. Vào **Database Access** (menu bên trái)
3. Tìm user `xuanbacliliana`
4. Click **"Edit"** → **"Edit Password"**
5. Tạo password mới (ví dụ: `MyNewPassword123!`)
6. **Copy password ngay** (không xem lại được)
7. Cập nhật trong `.env.local`:
   ```env
   MONGODB_URI=mongodb+srv://xuanbacliliana:MyNewPassword123!@cluster0.sdcul4j.mongodb.net/repins?retryWrites=true&w=majority
   ```

### Bước 2: Kiểm tra Network Access

1. Vào **Network Access** (menu bên trái)
2. Click **"Add IP Address"**
3. Chọn **"Allow Access from Anywhere"** (`0.0.0.0/0`)
   - ⚠️ Chỉ dùng cho development!
   - ⚠️ Không dùng cho production!
4. Click **"Confirm"**
5. Đợi vài phút để cập nhật

### Bước 3: Kiểm tra quyền user

1. Vào **Database Access**
2. Tìm user `xuanbacliliana`
3. Click **"Edit"**
4. Trong **"Database User Privileges"**, chọn:
   - **"Atlas admin"** (khuyến nghị cho dev)
5. Click **"Update User"**

### Bước 4: Test lại kết nối

```bash
cd frontend
npm run debug-db
```

## 📝 Lấy Connection String mới từ MongoDB Atlas:

1. Vào MongoDB Atlas → **Database** (menu bên trái)
2. Click **"Connect"** trên cluster của bạn
3. Chọn **"Connect your application"**
4. Chọn driver: **Node.js**, version: **5.5 or later**
5. Copy connection string
6. Thay `<password>` bằng password thật
7. Thay `<dbname>` bằng `repins` (nếu cần)

## 🔐 Bảo mật:

- ✅ **KHÔNG** commit file `.env.local` lên Git
- ✅ File `.env.local` đã có trong `.gitignore`
- ✅ Sử dụng password mạnh
- ✅ Không share connection string công khai

## 💡 Tips:

1. **Nếu vẫn lỗi sau khi reset password:**
   - Đợi 1-2 phút để MongoDB Atlas cập nhật
   - Thử lại connection

2. **Nếu password có ký tự đặc biệt:**
   - Tốt nhất: đổi password không có ký tự đặc biệt
   - Hoặc: URL encode password

3. **Test connection string trong MongoDB Compass:**
   - Mở MongoDB Compass
   - Paste connection string
   - Nếu kết nối được → connection string đúng
   - Nếu không → kiểm tra lại password và network access

## 📞 Cần hỗ trợ thêm?

Nếu vẫn không kết nối được sau khi thử các bước trên:
1. Kiểm tra lại tất cả các bước
2. Thử tạo user mới trong MongoDB Atlas
3. Thử connection string mới từ MongoDB Atlas



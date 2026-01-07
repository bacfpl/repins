# Hướng Dẫn Khắc Phục Lỗi MongoDB

## Lỗi: `ETIMEOUT` - Kết nối timeout

### Nguyên nhân
- Kết nối internet yếu hoặc bị mất
- IP address không được whitelist trên MongoDB Atlas
- Firewall hoặc network proxy chặn kết nối
- MongoDB server đang down

### Giải pháp

#### 1. **Kiểm tra IP Whitelist**
1. Đăng nhập vào [MongoDB Atlas](https://cloud.mongodb.com)
2. Vào **Security** → **Network Access**
3. Kiểm tra IP address của bạn đã được thêm chưa
4. Nếu chưa, click **Add IP Address** và:
   - Chọn **Add Current IP** để thêm IP hiện tại
   - Hoặc nhập `0.0.0.0/0` để cho phép tất cả IP (chỉ dùng cho development)

#### 2. **Kiểm tra Connection String**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/databaseName?retryWrites=true&w=majority&appName=Cluster0
```

Đảm bảo:
- Username và password đúng
- Database name có trong URL (ví dụ: `/repins` ở cuối host)
- Không có ký tự đặc biệt chưa encode

#### 3. **Kiểm tra Kết nối Internet**
```powershell
# Ping MongoDB host
ping cluster0.sdcul4j.mongodb.net

# Hoặc dùng nslookup
nslookup cluster0.sdcul4j.mongodb.net
```

---

## Lỗi: `EREFUSED` - Kết nối bị từ chối

### Nguyên nhân
- Connection string sai format
- MongoDB server không chạy
- Port sai
- Firewall chặn kết nối

### Giải pháp

#### 1. **Kiểm tra Connection String Format**
```
Đúng:  mongodb+srv://user:pass@cluster.mongodb.net/database?options
Sai:   mongodb+srv://user:pass@cluster.mongodb.net/?options  (thiếu database name)
```

#### 2. **Kiểm tra .env.local**
```bash
# File: .env.local
MONGODB_URI=mongodb+srv://repins:a9burfi2qtlEb9DZ@cluster0.sdcul4j.mongodb.net/repins?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DATABASE=repins
```

#### 3. **Reload Application**
```powershell
# Dừng server
Ctrl + C

# Xóa cache .next
Remove-Item .next -Recurse -Force

# Khởi động lại
npm run dev
```

---

## Kiểm tra Nhanh

### Cách 1: Dùng mongosh từ MongoDB Atlas
1. Vào MongoDB Atlas
2. Click **Connect** → **Shell**
3. Copy command và chạy trong terminal

### Cách 2: Dùng MongoDB Compass
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Paste connection string
3. Test connection

### Cách 3: Dùng Node.js Script
```javascript
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://repins:a9burfi2qtlEb9DZ@cluster0.sdcul4j.mongodb.net/repins?retryWrites=true&w=majority&appName=Cluster0';

const client = new MongoClient(uri);

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ Kết nối thành công!');
    await client.close();
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

testConnection();
```

---

## Checklist Khắc Phục

- [ ] IP address được thêm vào Network Access
- [ ] Connection string đúng format và có database name
- [ ] Username/password không có lỗi
- [ ] Kết nối internet hoạt động
- [ ] Firewall cho phép kết nối MongoDB
- [ ] Restart application sau khi thay đổi .env.local
- [ ] Kiểm tra lại file .env.local không có space thừa

---

## Tài Liệu Tham Khảo

- [MongoDB Atlas Connection String](https://docs.mongodb.com/manual/reference/connection-string/)
- [Network Access Control](https://docs.mongodb.com/manual/reference/connection-string/)
- [Troubleshooting Connection Issues](https://docs.mongodb.com/manual/reference/connection-string/)

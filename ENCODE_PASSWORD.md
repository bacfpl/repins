# 🔐 URL Encode Password cho MongoDB Connection String

## ⚠️ Vấn đề

Password trong `.env.example` có ký tự đặc biệt: `Abc123@#!`

Các ký tự đặc biệt trong password cần được URL encode khi đặt trong connection string:
- `@` → `%40`
- `#` → `%23`
- `!` → `%21`

## 📝 Password gốc:
```
Abc123@#!
```

## 🔄 Password sau khi encode:
```
Abc123%40%23%21
```

## ✅ Connection String đúng:

**Trước (SAI):**
```
mongodb+srv://repins:Abc123@#!@cluster0.sdcul4j.mongodb.net/?appName=Cluster0
```

**Sau (ĐÚNG):**
```
mongodb+srv://repins:Abc123%40%23%21@cluster0.sdcul4j.mongodb.net/repins?retryWrites=true&w=majority&appName=Cluster0
```

## 🛠️ Cách encode:

1. **Online tool:** https://www.urlencoder.org/
2. **Hoặc đổi password** không có ký tự đặc biệt (khuyến nghị)

## 💡 Khuyến nghị:

Tốt nhất là **đổi password** trong MongoDB Atlas thành password không có ký tự đặc biệt, ví dụ:
- `Abc123456` ✅
- `Repins2024!` (chỉ có `!` ở cuối, có thể encode)
- `MySecurePass123` ✅



# Giải thích về "Cluster" trong MongoDB Connection String

## 🔍 Cluster là gì?

**Cluster** trong MongoDB không phải là tên database, mà là **tên của MongoDB server/cluster** mà bạn đang kết nối tới.

## 📊 Cấu trúc MongoDB Connection String

### MongoDB Atlas (Cloud) - Có "cluster" trong URL:

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database?options
         └─┬─┘  └───┬───┘  └────┬────┘  └───┬───┘  └─┬─┘
           │        │            │           │        │
        Protocol  Credentials  CLUSTER    Database  Options
                                  │
                            (Tên server/cluster)
```

### MongoDB Local - Không có "cluster":

```
mongodb://localhost:27017/database
         └───┬────┘  └─┬─┘  └───┬───┘
             │         │        │
          Protocol    Host    Database
                      (IP/domain)
```

## 🎯 Phân biệt các thành phần:

### 1. **Cluster** (Server/Server Group)
- Là **địa chỉ server** MongoDB bạn kết nối tới
- Trong MongoDB Atlas: `cluster0.sdcul4j.mongodb.net`
- Trong MongoDB Local: `localhost:27017`
- **KHÔNG PHẢI** là tên database

### 2. **Database** (Database Name)
- Là **tên database** bạn muốn sử dụng
- Ví dụ: `productdb`, `mydb`, `testdb`
- Có thể có nhiều database trong cùng 1 cluster

### 3. **Collection** (Table tương đương SQL)
- Là **tên collection** (như table trong SQL)
- Ví dụ: `products`, `users`, `orders`
- Nằm trong database

## 📝 Ví dụ cụ thể:

### Connection String từ MongoDB Atlas:
```
mongodb+srv://user:pass@cluster0.abc123.mongodb.net/productdb?retryWrites=true
```

**Phân tích:**
- `mongodb+srv://` - Protocol (SRV record cho Atlas)
- `user:pass@` - Credentials
- `cluster0.abc123.mongodb.net` - **CLUSTER** (tên server)
- `productdb` - **DATABASE** (tên database)
- `?retryWrites=true` - Options

### Trong code của bạn:

```typescript
// .env.local
MONGODB_URI=mongodb+srv://user:pass@cluster0.xxx.mongodb.net/productdb
MONGODB_DATABASE=productdb
```

**Giải thích:**
- `cluster0.xxx.mongodb.net` → Đây là **địa chỉ cluster/server**
- `productdb` → Đây mới là **tên database**

## 🏗️ Kiến trúc MongoDB:

```
MongoDB Atlas
└── Cluster (cluster0.xxx.mongodb.net)
    ├── Database: productdb
    │   ├── Collection: products
    │   ├── Collection: categories
    │   └── Collection: brands
    ├── Database: userdb
    │   └── Collection: users
    └── Database: orderdb
        └── Collection: orders
```

## 💡 Tại sao có "cluster" trong URL?

1. **MongoDB Atlas** (cloud service) sử dụng **cluster** để:
   - Quản lý nhiều server MongoDB
   - Cung cấp high availability
   - Load balancing
   - Replication

2. **Tên cluster** (`cluster0`, `cluster1`, ...) là:
   - Tên do MongoDB Atlas tự động tạo
   - Hoặc bạn có thể đặt tên khi tạo cluster
   - Dùng để định danh server group của bạn

## 🔄 So sánh với SQL Server:

| MongoDB | SQL Server | Giải thích |
|---------|-----------|------------|
| Cluster | Server Instance | Địa chỉ server |
| Database | Database | Tên database |
| Collection | Table | Bảng dữ liệu |
| Document | Row | Dòng dữ liệu |

## ✅ Kết luận:

- **Cluster** = Tên/địa chỉ của MongoDB server (giống như `localhost` hoặc `server.com`)
- **Database** = Tên database bạn muốn sử dụng (giống như `productdb`)
- **Collection** = Tên collection/table (giống như `products`)

**Trong connection string:**
- `cluster0.xxx.mongodb.net` → Server/Cluster
- `productdb` → Database name
- Code sẽ kết nối tới cluster, sau đó chọn database `productdb`



const { MongoClient } = require("mongodb");
require("dotenv").config({ path: ".env.local" });

const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DATABASE;

async function test() {
  const client = new MongoClient(MONGO_URI);
  try {
    console.log("🔄 Connecting to MongoDB Atlas...");
    await client.connect();
    console.log("✅ Connected!");

    const db = client.db(DB_NAME);
    
    const productCount = await db.collection("products").countDocuments();
    const categoryCount = await db.collection("categories").countDocuments();
    const brandCount = await db.collection("brands").countDocuments();
    
    console.log("\n📊 Dữ liệu hiện tại:");
    console.log(`   - Products: ${productCount}`);
    console.log(`   - Categories: ${categoryCount}`);
    console.log(`   - Brands: ${brandCount}`);

    if (productCount > 0) {
      const firstProduct = await db.collection("products").findOne({});
      console.log("\n📦 Sản phẩm đầu tiên:");
      console.log(firstProduct);
    }

    // Insert thêm các sản phẩm còn thiếu
    console.log("\n📦 Inserting thêm sản phẩm...");
    const productsToAdd = [
      {
        _id: "prod-2",
        sku: "SKU002",
        name: "Samsung Galaxy S24",
        description: "Điện thoại flagship của Samsung",
        price: "24,990,000",
        priceValue: 24990000,
        stock: 15,
        categoryId: "cat-1",
        brandId: "brand-2",
        category: "Điện thoại",
        brand: "Samsung",
        rating: 4.7,
        reviews: 200,
        image: "https://res.cloudinary.com/dxcr6uqhp/image/upload/v1234567890/galaxy_s24_def456.jpg",
        primaryImageId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: "prod-3",
        sku: "SKU003",
        name: "MacBook Pro 14",
        description: "Laptop cường mạ cho chuyên gia",
        price: "42,990,000",
        priceValue: 42990000,
        stock: 5,
        categoryId: "cat-2",
        brandId: "brand-1",
        category: "Laptop",
        brand: "Apple",
        rating: 4.9,
        reviews: 120,
        image: "https://res.cloudinary.com/dxcr6uqhp/image/upload/v1234567890/macbook_pro_ghi789.jpg",
        primaryImageId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: "prod-4",
        sku: "SKU004",
        name: "Dell XPS 15",
        description: "Laptop Windows cao cấp",
        price: "35,990,000",
        priceValue: 35990000,
        stock: 8,
        categoryId: "cat-2",
        brandId: "brand-3",
        category: "Laptop",
        brand: "Dell",
        rating: 4.6,
        reviews: 85,
        image: "https://res.cloudinary.com/dxcr6uqhp/image/upload/v1234567890/dell_xps_jkl012.jpg",
        primaryImageId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: "prod-5",
        sku: "SKU005",
        name: "Tai nghe Sony WH-1000XM5",
        description: "Tai nghe chống ồn tốt nhất",
        price: "8,990,000",
        priceValue: 8990000,
        stock: 30,
        categoryId: "cat-3",
        brandId: "brand-4",
        category: "Phụ kiện",
        brand: "Sony",
        rating: 4.8,
        reviews: 300,
        image: "https://res.cloudinary.com/dxcr6uqhp/image/upload/v1234567890/sony_wh1000xm5_mno345.jpg",
        primaryImageId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    let insertedCount = 0;
    for (const prod of productsToAdd) {
      try {
        await db.collection("products").updateOne(
          { _id: prod._id },
          { $set: prod },
          { upsert: true }
        );
        insertedCount++;
      } catch (e) {
        console.error(`❌ Lỗi khi insert ${prod._id}:`, e.message);
      }
    }
    console.log(`✅ Inserted/Updated ${insertedCount} products`);

    const finalCount = await db.collection("products").countDocuments();
    console.log(`\n📊 Tổng sản phẩm: ${finalCount}`);

    // Liệt kê tất cả sản phẩm
    const allProducts = await db.collection("products").find({}).toArray();
    console.log("\n📋 Danh sách sản phẩm:");
    allProducts.forEach((p, i) => {
      console.log(`${i+1}. ${p._id} - ${p.name} (SKU: ${p.sku || 'N/A'})`);
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.close();
  }
}

test();

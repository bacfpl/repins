import { MongoClient, ObjectId } from "mongodb";
import * as dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/webb";

async function seedTestData() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db("webb");

    // Clear existing data
    await db.collection("products").deleteMany({});
    await db.collection("categories").deleteMany({});
    await db.collection("brands").deleteMany({});

    // Create sample categories
    const categoryResult = await db.collection("categories").insertMany([
      { _id: "cat-1", name: "Điện thoại", description: "Các loại điện thoại thông minh" } as any,
      { _id: "cat-2", name: "Laptop", description: "Máy tính xách tay" } as any,
      { _id: "cat-3", name: "Phụ kiện", description: "Phụ kiện điện tử" } as any,
    ]);

    console.log(`✅ Created ${categoryResult.insertedCount} categories`);

    // Create sample brands
    const brandResult = await db.collection("brands").insertMany([
      { _id: "brand-1", name: "Apple" } as any,
      { _id: "brand-2", name: "Samsung" } as any,
      { _id: "brand-3", name: "Dell" } as any,
      { _id: "brand-4", name: "Sony" } as any,
    ]);

    console.log(`✅ Created ${brandResult.insertedCount} brands`);

    // Create sample products
    const productResult = await db.collection("products").insertMany([
      {
        _id: "prod-1",
        name: "iPhone 15 Pro",
        description: "Smartphone cao cấp từ Apple",
        price: "29,990,000",
        priceValue: 29990000,
        stock: 10,
        category: "Điện thoại",
        brand: "Apple",
        rating: 4.8,
        reviews: 150,
        image: "https://res.cloudinary.com/dxcr6uqhp/image/upload/v1234567890/iphone15_abc123.jpg",
        primaryImageId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      {
        _id: "prod-2",
        name: "Samsung Galaxy S24",
        description: "Điện thoại flagship của Samsung",
        price: "24,990,000",
        priceValue: 24990000,
        stock: 15,
        category: "Điện thoại",
        brand: "Samsung",
        rating: 4.7,
        reviews: 200,
        image: "https://res.cloudinary.com/dxcr6uqhp/image/upload/v1234567890/galaxy_s24_def456.jpg",
        primaryImageId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      {
        _id: "prod-3",
        name: "MacBook Pro 14",
        description: "Laptop cường mạ cho chuyên gia",
        price: "42,990,000",
        priceValue: 42990000,
        stock: 5,
        category: "Laptop",
        brand: "Apple",
        rating: 4.9,
        reviews: 120,
        image: "https://res.cloudinary.com/dxcr6uqhp/image/upload/v1234567890/macbook_pro_ghi789.jpg",
        primaryImageId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      {
        _id: "prod-4",
        name: "Dell XPS 15",
        description: "Laptop Windows cao cấp",
        price: "35,990,000",
        priceValue: 35990000,
        stock: 8,
        category: "Laptop",
        brand: "Dell",
        rating: 4.6,
        reviews: 85,
        image: "https://res.cloudinary.com/dxcr6uqhp/image/upload/v1234567890/dell_xps_jkl012.jpg",
        primaryImageId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any,
      {
        _id: "prod-5",
        name: "Tai nghe Sony WH-1000XM5",
        description: "Tai nghe chống ồn tốt nhất",
        price: "8,990,000",
        priceValue: 8990000,
        stock: 30,
        category: "Phụ kiện",
        brand: "Sony",
        rating: 4.8,
        reviews: 300,
        image: "https://res.cloudinary.com/dxcr6uqhp/image/upload/v1234567890/sony_wh1000xm5_mno345.jpg",
        primaryImageId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    console.log(`✅ Created ${productResult.insertedCount} products`);

    console.log("\n✨ Seeding test data completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  } finally {
    await client.close();
  }
}

seedTestData();

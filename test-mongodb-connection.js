#!/usr/bin/env node

/**
 * Test MongoDB Connection
 * Chạy: node test-mongodb-connection.js
 */

const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'productdb';

console.log('🔧 Testing MongoDB Connection...\n');
console.log(`📍 Database: ${MONGODB_DATABASE}`);
console.log(`🔐 Connection String: ${maskUri(MONGODB_URI)}\n`);

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

async function testConnection() {
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  try {
    console.log('⏳ Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Test database connection
    const db = client.db(MONGODB_DATABASE);
    console.log('📊 Database Information:');
    console.log(`   Database: ${db.name}`);

    // Get server info
    const adminDb = client.db('admin');
    const serverStatus = await adminDb.command({ serverStatus: 1 });
    console.log(`   Server: MongoDB ${serverStatus.version}`);
    console.log(`   Uptime: ${serverStatus.uptime} seconds\n`);

    // Test collections
    const collections = await db.listCollections().toArray();
    console.log(`📦 Collections (${collections.length}):`);
    collections.forEach((col) => {
      console.log(`   - ${col.name}`);
    });

    // Test sample data
    console.log('\n📋 Sample Data:');
    const productsCollection = db.collection('products');
    const count = await productsCollection.countDocuments();
    console.log(`   Products: ${count}`);

    const categoriesCollection = db.collection('categories');
    const categoriesCount = await categoriesCollection.countDocuments();
    console.log(`   Categories: ${categoriesCount}`);

    const brandsCollection = db.collection('brands');
    const brandsCount = await brandsCollection.countDocuments();
    console.log(`   Brands: ${brandsCount}`);

    console.log('\n✅ All tests passed! MongoDB is working correctly.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection failed!\n');
    console.error(`Error: ${error.message}`);
    console.error(`Code: ${error.code}\n`);

    // Provide suggestions
    if (error.code === 'ETIMEOUT' || error.message.includes('ETIMEOUT')) {
      console.error('💡 Suggestions for ETIMEOUT:');
      console.error('   1. Check IP whitelist: https://cloud.mongodb.com/v2#/org/security/networkAccess');
      console.error('   2. Add your IP or 0.0.0.0/0 (development only)');
      console.error('   3. Check internet connection');
    } else if (error.code === 'EREFUSED' || error.message.includes('EREFUSED')) {
      console.error('💡 Suggestions for EREFUSED:');
      console.error('   1. Check connection string format');
      console.error('   2. Verify username and password');
      console.error('   3. Ensure database name is in URL');
    } else if (error.message.includes('authentication failed')) {
      console.error('💡 Suggestions for Authentication Error:');
      console.error('   1. Check username and password');
      console.error('   2. Verify special characters are properly encoded');
    }

    process.exit(1);
  } finally {
    await client.close();
  }
}

function maskUri(uri) {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
}

testConnection();

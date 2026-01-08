import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables - ưu tiên .env.local
// Note: Next.js already loads .env.local automatically, but this ensures it's loaded
if (process.env.NODE_ENV !== 'production') {
  config({ path: resolve(process.cwd(), '.env.local') });
  config({ path: resolve(process.cwd(), '.env') });
}

export interface MongoDBConfig {
  uri: string;
  database: string;
  options?: {
    maxPoolSize?: number;
    minPoolSize?: number;
    maxIdleTimeMS?: number;
    serverSelectionTimeoutMS?: number;
    socketTimeoutMS?: number;
  };
}

/**
 * Extract database name from MongoDB connection string
 * @param uri - MongoDB connection string
 * @returns Database name if found in URI, otherwise null
 */
function extractDatabaseFromUri(uri: string): string | null {
  try {
    // Pattern: mongodb://host:port/database?options or mongodb+srv://host/database?options
    // Match the database name between the last / and the first ? or end of string
    // But exclude if it contains : (port) or @ (credentials)
    const match = uri.match(/\/([^/?]+)(\?|$)/);
    if (match && match[1] && match[1] !== '') {
      const dbName = match[1];
      // Exclude if it's part of credentials (username:password@host) or contains port (:)
      if (!dbName.includes('@') && !dbName.includes(':')) {
        return dbName;
      }
    }
    return null;
  } catch {
    return null;
  }
}

// Debug: Log all environment variables related to MongoDB
if (process.env.NODE_ENV !== 'production') {
  console.log('🔍 Environment Variables Debug:');
  console.log('   NODE_ENV:', process.env.NODE_ENV);
  console.log('   MONGODB_URI exists:', !!process.env.MONGODB_URI);
  console.log('   MONGODB_URI:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 50) + '...' : 'undefined');
  console.log('   MONGODB_DATABASE:', process.env.MONGODB_DATABASE);
}

// Get connection string from environment
const rawUri = process.env.MONGODB_URI;

// Validate connection string
if (!rawUri) {
  console.error('❌ MONGODB_URI not set!');
  console.error('   Tried to load from: process.env.MONGODB_URI');
  console.error('   Please set MONGODB_URI in:');
  console.error('   - Local: .env.local file');
  console.error('   - Vercel: Dashboard → Settings → Environment Variables');
  console.error('   Format: mongodb+srv://username:password@cluster.xxx.mongodb.net/database?retryWrites=true&w=majority');
  console.error('');
  console.error('   Current environment:');
  console.error('   - NODE_ENV:', process.env.NODE_ENV);
  console.error('   - CWD:', process.cwd());
  
  if (process.env.NODE_ENV === 'production') {
    throw new Error('MONGODB_URI environment variable is not set on Vercel!');
  }
  // Fallback for local development only
  console.warn('⚠️  Falling back to localhost (only for local dev with MongoDB running)');
}

// Extract database name from connection string if present, otherwise use env var
const databaseFromUri = rawUri ? extractDatabaseFromUri(rawUri) : null;
const databaseName = databaseFromUri || process.env.MONGODB_DATABASE || 'productdb';

// Use original connection string - MongoDB driver will handle it correctly
// Database name will be specified separately when calling client.db()
const connectionUri = rawUri || 'mongodb://localhost:27017';

export const mongodbConfig: MongoDBConfig = {
  uri: connectionUri,
  database: databaseName,
  options: {
    maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10'),
    minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '5'),
    maxIdleTimeMS: parseInt(process.env.MONGODB_MAX_IDLE_TIME_MS || '30000'),
    serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || '5000'),
    socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT_MS || '45000'),
  },
};

// Log configuration (without sensitive data) - only in development
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  const maskedUri = connectionUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
  console.log('📦 MongoDB Config:', {
    uri: maskedUri,
    database: databaseName,
    databaseSource: databaseFromUri ? 'extracted from URI' : 'from MONGODB_DATABASE env',
    options: mongodbConfig.options,
  });
}


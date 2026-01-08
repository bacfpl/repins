import { MongoClient, Db, Collection, Document } from 'mongodb';
import { mongodbConfig } from './mongodb.config';

let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * Kiểm tra nếu client vẫn connected
 */
function isClientConnected(): boolean {
  // Đơn giản: chỉ check xem client có tồn tại không
  // Lỗi kết nối sẽ được xử lý khi thực hiện query
  return client !== null;
}

/**
 * Reset connection (dùng khi detect topology closed)
 */
async function resetConnection(): Promise<void> {
  try {
    if (client) {
      await client.close().catch(() => {});
      client = null;
      db = null;
    }
  } catch {
    client = null;
    db = null;
  }
}

/**
 * Kết nối tới MongoDB
 * @returns Promise<Db>
 */
export async function connect(): Promise<Db> {
  try {
    // Nếu đã có connection và còn active, return luôn
    if (db && isClientConnected()) {
      return db;
    }

    // Nếu connection bị closed, reset
    if (db && !isClientConnected()) {
      console.warn('⚠️  MongoDB topology closed, reconnecting...');
      await resetConnection();
    }

    if (!client) {
      // Validate connection string
      if (!mongodbConfig.uri || mongodbConfig.uri.trim() === '') {
        throw new Error('MONGODB_URI không được để trống. Vui lòng kiểm tra file .env.local');
      }

      // Check if connection string contains password placeholder
      if (mongodbConfig.uri.includes('<db_password>')) {
        throw new Error('Vui lòng thay <db_password> trong MONGODB_URI bằng password thật của bạn');
      }

      // Tăng timeout và thêm retry options cho handshake
      const clientOptions = {
        ...mongodbConfig.options,
        serverSelectionTimeoutMS: 15000, // Tăng timeout lên 15 giây (Vercel serverless needs more time)
        connectTimeoutMS: 15000,
        socketTimeoutMS: 60000,
        retryWrites: true,
        retryReads: true,
        // Xử lý lỗi handshake tốt hơn
        maxPoolSize: mongodbConfig.options?.maxPoolSize || 5,
        minPoolSize: mongodbConfig.options?.minPoolSize || 1,
        // Giữ connection alive lâu hơn trên Vercel
        maxIdleTimeMS: 60000,
      };
      
      client = new MongoClient(mongodbConfig.uri, clientOptions);
      
      // Thử kết nối với retry logic
      let retries = 3;
      let lastError: Error | null = null;
      
      while (retries > 0) {
        try {
          await client.connect();
          console.log('✅ Đã kết nối thành công tới MongoDB');
          console.log(`📊 Database: ${mongodbConfig.database}`);
          break; // Thành công, thoát khỏi loop
        } catch (error: any) {
          lastError = error;
          retries--;
          
          // Nếu là HandshakeError, thử lại
          if (error.codeName === 'HandshakeError' || 
              (error.errorLabelSet && error.errorLabelSet.has('HandshakeError'))) {
            console.log(`⚠️  HandshakeError, đang thử lại... (còn ${retries} lần)`);
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 2000)); // Đợi 2 giây
              continue;
            }
          }
          
          // Nếu không phải HandshakeError hoặc hết retry, throw error
          throw error;
        }
      }
      
      if (retries === 0 && lastError) {
        throw lastError;
      }
    }

    db = client.db(mongodbConfig.database);
    return db;
  } catch (error: any) {
    console.error('❌ Lỗi kết nối MongoDB:', error);
    const errorCode = error.code || error.syscall || '';
    const errorMessage = error.message || '';
    
    if (errorMessage.includes('authentication failed')) {
      console.error('💡 Gợi ý: Kiểm tra lại username và password trong connection string');
    } else if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('getaddrinfo')) {
      console.error('💡 Gợi ý: Kiểm tra lại connection string hoặc kết nối internet');
    } else if (errorCode === 'ETIMEOUT' || errorMessage.includes('ETIMEOUT')) {
      console.error('💡 Lỗi ETIMEOUT - Kết nối timeout. Các nguyên nhân có thể:');
      console.error('   1. Kết nối internet yếu hoặc bị mất');
      console.error('   2. IP address của bạn không được whitelist trên MongoDB Atlas');
      console.error('   3. Firewall hoặc network proxy chặn kết nối');
      console.error('   4. MongoDB server đang down');
      console.error('💡 Giải pháp:');
      console.error('   - Kiểm tra IP whitelist: https://cloud.mongodb.com/v2#/org/security/networkAccess');
      console.error('   - Thêm IP hiện tại của bạn hoặc 0.0.0.0/0 (cho phép tất cả)');
      console.error('   - Kiểm tra kết nối internet');
    } else if (errorCode === 'EREFUSED' || errorMessage.includes('EREFUSED')) {
      console.error('💡 Lỗi EREFUSED - Kết nối bị từ chối. Các nguyên nhân có thể:');
      console.error('   1. MongoDB server không chạy hoặc địa chỉ sai');
      console.error('   2. Port MongoDB không đúng');
      console.error('   3. Connection string sai format');
      console.error('   4. Firewall chặn kết nối');
      console.error('💡 Kiểm tra:');
      console.error(`   - MONGODB_URI: ${maskConnectionString(mongodbConfig.uri)}`);
      console.error(`   - MONGODB_DATABASE: ${mongodbConfig.database}`);
    }
    throw error;
  }
}

/**
 * Mask sensitive information in connection string for logging
 */
function maskConnectionString(uri: string): string {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
}

/**
 * Đóng kết nối MongoDB
 */
export async function close(): Promise<void> {
  try {
    if (client) {
      await client.close();
      client = null;
      db = null;
      console.log('✅ Đã đóng kết nối MongoDB');
    }
  } catch (error) {
    console.error('❌ Lỗi khi đóng kết nối:', error);
    throw error;
  }
}

/**
 * Lấy collection từ database (với automatic reconnect nếu topology closed)
 * @param collectionName - Tên collection
 * @returns Promise<Collection>
 */
export async function getCollection<T extends Document = Document>(
  collectionName: string
): Promise<Collection<T>> {
  try {
    const database = await connect();
    return database.collection<T>(collectionName);
  } catch (error: any) {
    // Nếu gặp lỗi "Topology is closed", reset và thử lại
    if (error.message?.includes('Topology is closed') || 
        error.message?.includes('connection closed') ||
        error.message?.includes('ECONNREFUSED')) {
      console.warn('⚠️  Connection lost, attempting to reconnect...');
      await resetConnection();
      const database = await connect();
      return database.collection<T>(collectionName);
    }
    throw error;
  }
}

/**
 * Kiểm tra kết nối database
 * @returns Promise<boolean>
 */
export async function testConnection(): Promise<boolean> {
  try {
    const database = await connect();
    await database.admin().ping();
    return true;
  } catch (error) {
    console.error('❌ Lỗi kiểm tra kết nối:', error);
    return false;
  }
}

/**
 * Tạo index cho collection
 * @param collectionName - Tên collection
 * @param indexSpec - Định nghĩa index
 */
export async function createIndex(
  collectionName: string,
  indexSpec: Record<string, 1 | -1>,
  options?: { unique?: boolean; name?: string }
): Promise<void> {
  try {
    const collection = await getCollection(collectionName);
    await collection.createIndex(indexSpec, options);
    console.log(`✅ Đã tạo index cho collection ${collectionName}`);
  } catch (error) {
    console.error(`❌ Lỗi khi tạo index cho ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Execute database operation with automatic retry on topology errors
 * This wrapper catches topology errors that happen during query execution
 * @param operation - Async function that performs the DB operation
 * @param retries - Number of retries (default: 3)
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  retries: number = 3
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      const isTopologyError = 
        error.name === 'MongoTopologyClosedError' ||
        error.message?.includes('Topology is closed') ||
        error.message?.includes('connection closed') ||
        error.message?.includes('ECONNREFUSED') ||
        error.message?.includes('topology');

      if (isTopologyError && i < retries - 1) {
        console.warn(`⚠️  Topology error detected, retrying... (attempt ${i + 1}/${retries})`);
        await resetConnection(); // Reset connection
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}

// Export default connection
export default { connect, close, getCollection, testConnection, createIndex, withRetry };


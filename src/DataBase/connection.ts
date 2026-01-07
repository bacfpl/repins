import sql from 'mssql';
import { dbConfig } from './config';

let pool: sql.ConnectionPool | null = null;

/**
 * Kết nối tới SQL Server
 * @returns Promise<sql.ConnectionPool>
 */
export async function connect(): Promise<sql.ConnectionPool> {
  try {
    if (pool && pool.connected) {
      return pool;
    }

    pool = await sql.connect(dbConfig);
    console.log('✅ Đã kết nối thành công tới SQL Server');
    return pool;
  } catch (error) {
    console.error('❌ Lỗi kết nối SQL Server:', error);
    throw error;
  }
}

/**
 * Đóng kết nối database
 */
export async function close(): Promise<void> {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('✅ Đã đóng kết nối SQL Server');
    }
  } catch (error) {
    console.error('❌ Lỗi khi đóng kết nối:', error);
    throw error;
  }
}

/**
 * Thực thi query và trả về kết quả
 * @param query - SQL query string
 * @param params - Query parameters (optional)
 * @returns Promise<any>
 */
export async function executeQuery<T = any>(
  query: string,
  params?: Record<string, any>
): Promise<T[]> {
  try {
    const connection = await connect();
    const request = connection.request();

    // Thêm parameters nếu có
    if (params) {
      Object.keys(params).forEach((key) => {
        request.input(key, params[key]);
      });
    }

    const result = await request.query(query);
    return result.recordset as T[];
  } catch (error) {
    console.error('❌ Lỗi khi thực thi query:', error);
    throw error;
  }
}

/**
 * Thực thi stored procedure
 * @param procedureName - Tên stored procedure
 * @param params - Parameters (optional)
 * @returns Promise<any>
 */
export async function executeProcedure<T = any>(
  procedureName: string,
  params?: Record<string, any>
): Promise<T[]> {
  try {
    const connection = await connect();
    const request = connection.request();

    // Thêm parameters nếu có
    if (params) {
      Object.keys(params).forEach((key) => {
        request.input(key, params[key]);
      });
    }

    const result = await request.execute(procedureName);
    return result.recordset as T[];
  } catch (error) {
    console.error('❌ Lỗi khi thực thi stored procedure:', error);
    throw error;
  }
}

/**
 * Kiểm tra kết nối database
 * @returns Promise<boolean>
 */
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await connect();
    await connection.request().query('SELECT 1');
    return true;
  } catch (error) {
    console.error('❌ Lỗi kiểm tra kết nối:', error);
    return false;
  }
}

// Export default connection pool
export default { connect, close, executeQuery, executeProcedure, testConnection };



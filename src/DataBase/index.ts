// MongoDB exports (default)
export { connect, close, getCollection, testConnection, createIndex } from './mongodb.connection';
export { mongodbConfig, type MongoDBConfig } from './mongodb.config';
export * from './mongodb.schema';
export { default as db } from './mongodb.connection';

// SQL Server exports (legacy - có thể xóa nếu không dùng)
export { connect as connectSQL, close as closeSQL, executeQuery, executeProcedure, testConnection as testConnectionSQL } from './connection';
export { dbConfig, type DatabaseConfig } from './config';


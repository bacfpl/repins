import { config } from 'dotenv';

// Load environment variables
config();

export interface DatabaseConfig {
  server: string;
  database: string;
  user: string;
  password: string;
  port?: number;
  options: {
    encrypt: boolean;
    trustServerCertificate?: boolean;
    enableArithAbort?: boolean;
  };
  pool?: {
    max: number;
    min: number;
    idleTimeoutMillis: number;
  };
}

export const dbConfig: DatabaseConfig = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || '',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};



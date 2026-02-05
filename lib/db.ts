import { Pool } from 'pg';

// This adds the pool to the NodeJS global type
declare global {
  var postgresPool: Pool | undefined;
}

// إنشاء الاتصال
const pool = global.postgresPool || new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
});

// In development, save the pool to the global object to prevent multiple connections
if (process.env.NODE_ENV !== 'production') {
  global.postgresPool = pool;
}

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  
  console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
};

export default pool;
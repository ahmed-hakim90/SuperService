import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Create postgres connection
const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString, { 
  max: 1,
  ssl: 'require',
  idle_timeout: 20,
  max_lifetime: 60 * 30
});

// Create drizzle instance
export const db = drizzle(sql, { schema });

// Export schema for use in queries
export * from '../shared/schema';
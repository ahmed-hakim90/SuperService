import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import { createClient } from '@supabase/supabase-js';
<<<<<<< HEAD
=======

neonConfig.webSocketConstructor = ws;
>>>>>>> 2d9affa43e02d1a5ca538cc8e743e8e777589c88

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client, { schema });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export const supabaseDb = supabase;

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
export const supabaseDb = supabase;

// Export schema for use in queries
export * from '../shared/schema';
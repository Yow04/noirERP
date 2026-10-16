
import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL atau POSTGRES_URL belum dikonfigurasi");
}

// Nonaktifkan prepared statements agar kompatibel dengan Supabase Transaction Pooler (port 6543)
// dan tetap kompatibel dengan PostgreSQL lokal
const client = postgres(connectionString, {
    prepare: false,
});

export const db = drizzle(client, { schema });
export { client };
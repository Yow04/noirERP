
import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from './schema/index';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
    console.warn("⚠️ PERINGATAN: DATABASE_URL atau POSTGRES_URL belum dikonfigurasi di Environment Variables!");
}

// Nonaktifkan prepared statements agar kompatibel dengan Serverless Connection Pooler (Vercel/Neon/Supabase)
// dan fallback agar serverless function tidak langsung crash saat startup
const client = postgres(connectionString || "postgresql://localhost:5432/noirDatabase", {
    prepare: false,
});

export const db = drizzle(client, { schema });
export { client };
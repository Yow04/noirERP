import "dotenv/config";
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sql } from "drizzle-orm";
import { db } from "./db/index";
import productsRoutes from "./routes/product";
import dashboardRoutes from "./routes/dashboard";
import inventoryRoutes from "./routes/inventory";
import purchaseRoutes from "./routes/purchase";
import salesRoutes from "./routes/sales";
import categoryRoutes from "./routes/category";
import userRoutes from "./routes/user";
import authRoutes from "./routes/auth";
import { seed } from "./db/seed";

const app = new Hono()

app.use(
  "/api/*",
  cors({
    origin: (origin) => origin || "*",
    allowMethods: [
      "GET",
      "POST",
      "DELETE",
      "PATCH",
      "OPTIONS",
    ],
    allowHeaders: ["Content-Type", "Authorization"]
  }),
);

import { users } from "./db/schema/index";
import { verify } from "hono/jwt";

const JWT_SECRET = process.env.JWT_SECRET_KEY || "noir_erp_fallback_secret_key_2026";

app.get("/", (c) => {
  return c.json({
    success: true,
    message: "NoirERP is running",
  });
});

app.get("/health", (c) => {
  return c.json({
    success: true,
    message: "API is healthy enough to start answering request",
  });
});

app.get("/health/database", async (c) => {
  try {
    await db.execute(sql`SELECT 1`);

    return c.json({
      success: true,
      message: "Database connection success"
    });
  } catch (error) {
    console.error("Database connection failed", error);

    return c.json({
      success: false,
      message: "Unable to connect database"
    }, 500);
  }
});

app.get("/api/v1", (c) => {
  return c.json({
    success: true,
    message: "Welcome to API for noirERP",
  });
});

app.get("/api/v1/health", (c) => {
  return c.json({
    success: true,
    message: "API is healthy enough to start answering request",
  });
});

app.route('/api/v1/auth', authRoutes);
app.route('/api/v1/categories', categoryRoutes);
app.route('/api/v1/products', productsRoutes);
app.route('/api/v1/dashboard', dashboardRoutes);
app.route('/api/v1/inventory', inventoryRoutes);
app.route('/api/v1/purchases', purchaseRoutes);
app.route('/api/v1/sales', salesRoutes);
app.route('/api/v1/users', userRoutes);

// Endpoint khusus untuk mempermudah inisialisasi dummy data di environment deployment/preview
// Jika database sudah memiliki data user, endpoint ini wajib menyertakan token Admin
app.post('/api/v1/seed', async (c) => {
  try {
    const existingUsers = await db.select({ id: users.id }).from(users).limit(1);

    if (existingUsers.length > 0) {
      const authHeader = c.req.header("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json({
          success: false,
          message: "Akses ditolak: Seeding database yang sudah aktif memerlukan otentikasi Admin.",
        }, 401);
      }

      const token = authHeader.split(" ")[1];
      try {
        const payload = (await verify(token, JWT_SECRET, "HS256")) as { role?: string };
        if (payload.role?.toLowerCase() !== "admin") {
          return c.json({
            success: false,
            message: "Akses ditolak: Hanya peran Admin yang diizinkan melakukan reset/seeding database.",
          }, 403);
        }
      } catch {
        return c.json({
          success: false,
          message: "Akses ditolak: Token autentikasi tidak valid atau kedaluwarsa.",
        }, 401);
      }
    }

    await seed();
    return c.json({
      success: true,
      message: "Database dummy data seeded successfully for deployment preview",
    }, 200);
  } catch (error) {
    console.error("Seed error:", error);
    return c.json({
      success: false,
      message: "Failed to seed dummy data",
      error: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});

// Global 404 Handler
app.notFound((c) => {
  return c.json({
    success: false,
    message: `Endpoint tidak ditemukan: ${c.req.method} ${c.req.path}`,
  }, 404);
});

// Global Error Handler
app.onError((err, c) => {
  console.error("Unhandled API Error:", err);
  return c.json({
    success: false,
    message: "Terjadi kesalahan internal server.",
    error: err instanceof Error ? err.message : String(err),
  }, 500);
});

export type AppType = typeof app;
export { app };
export default app;
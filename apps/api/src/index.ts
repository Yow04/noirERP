import "dotenv/config";
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sql } from "drizzle-orm";
import { db } from "./db";
import productsRoutes from "./routes/product";
import dashboardRoutes from "./routes/dashboard";
import inventoryRoutes from "./routes/inventory";
import purchaseRoutes from "./routes/purchase";
import salesRoutes from "./routes/sales";
import categoryRoutes from "./routes/category";
import userRoutes from "./routes/user";
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

app.get("/", (c) => {
  return c.json({
    succes: "true",
    message: "NoirERP is running",
  });
});

app.get("/health", (c) => {
  return c.json({
    succes: "true",
    message: "API is healthy enough to start answering request",
  });
});

app.get("/health/database", async (c) => {
  try {
    await db.execute(sql`SELECT 1`);

    return c.json({
      success: "true",
      message: "Database connection succes"
    });
  } catch (error) {
    console.error("Database connection failed", error);

    return c.json({
      success: "false",
      message: "Unable to connect database"
    }, 500);
  }
});

app.get("/api/v1", (c) => {
  return c.json({
    succes: "true",
    message: "Welcome to API for noirERP",
  });
});

app.route('/api/v1/categories', categoryRoutes);
app.route('/api/v1/products', productsRoutes);
app.route('/api/v1/dashboard', dashboardRoutes);
app.route('/api/v1/inventory', inventoryRoutes);
app.route('/api/v1/purchases', purchaseRoutes);
app.route('/api/v1/sales', salesRoutes);
app.route('/api/v1/users', userRoutes);

// Endpoint khusus untuk mempermudah inisialisasi dummy data di environment deployment/preview
app.post('/api/v1/seed', async (c) => {
  try {
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

export { app };
export default app;
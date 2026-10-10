import "dotenv/config";
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sql } from "drizzle-orm";
import { db } from "./db";
import productsRoutes from "./routes/product";
import dashboardRoutes from "./routes/dashboard";
import inventoryRoutes from "./routes/inventory";

const app = new Hono()

app.use(
  "/api/*",
  cors({
    origin: "http://localhost:5173",
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

app.route('/api/v1/products', productsRoutes);
app.route('/api/v1/dashboard', dashboardRoutes);
app.route('/api/v1/inventory', inventoryRoutes);

export default {
  port: Number(process.env.API_PORT ?? "3000"),
  hostname: process.env.API_HOST ?? "127.0.0.1",
  fetch: app.fetch,
};
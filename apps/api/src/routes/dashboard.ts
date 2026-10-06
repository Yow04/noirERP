import { Hono } from "hono";
import { sql, count, sum, desc } from "drizzle-orm";
import { db } from "../db";
import { products, categories, users } from "../db/schema";

const dashboardRoutes = new Hono();

// Dashboard summary endpoint
dashboardRoutes.get("/", async (c) => {
    try {
        // Total products count
        const [productCount] = await db
            .select({ count: count() })
            .from(products);

        // Total categories count
        const [categoryCount] = await db
            .select({ count: count() })
            .from(categories);

        // Total users count
        const [userCount] = await db
            .select({ count: count() })
            .from(users);

        // Total stock
        const [stockSum] = await db
            .select({ total: sum(products.stock) })
            .from(products);

        // Total inventory value (purchase price * stock)
        const [inventoryValue] = await db
            .select({
                total: sql<string>`COALESCE(SUM(CAST(${products.purchasePrice} AS NUMERIC) * ${products.stock}), 0)`,
            })
            .from(products);

        // Total potential revenue (selling price * stock)
        const [revenueValue] = await db
            .select({
                total: sql<string>`COALESCE(SUM(CAST(${products.sellingPrice} AS NUMERIC) * ${products.stock}), 0)`,
            })
            .from(products);

        // Low stock products (stock <= 5)
        const [lowStockCount] = await db
            .select({ count: count() })
            .from(products)
            .where(sql`${products.stock} <= 5`);

        // Out of stock products (stock = 0)
        const [outOfStockCount] = await db
            .select({ count: count() })
            .from(products)
            .where(sql`${products.stock} = 0`);

        // Recent products (last 5)
        const recentProducts = await db
            .select({
                id: products.id,
                sku: products.sku,
                name: products.name,
                sellingPrice: products.sellingPrice,
                stock: products.stock,
                createdAt: products.createdAt,
            })
            .from(products)
            .orderBy(desc(products.createdAt))
            .limit(5);

        return c.json({
            success: true,
            message: "Dashboard data retrieved successfully",
            data: {
                totalProducts: productCount.count,
                totalCategories: categoryCount.count,
                totalUsers: userCount.count,
                totalStock: Number(stockSum.total ?? 0),
                inventoryValue: Number(inventoryValue.total ?? 0),
                potentialRevenue: Number(revenueValue.total ?? 0),
                lowStockCount: lowStockCount.count,
                outOfStockCount: outOfStockCount.count,
                recentProducts,
            },
        }, 200);
    } catch (error) {
        console.error("Dashboard error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch dashboard data",
        }, 500);
    }
});

export default dashboardRoutes;

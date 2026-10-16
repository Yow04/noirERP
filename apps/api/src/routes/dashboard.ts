import { Hono } from "hono";
import { sql, count, sum, desc, gte, eq, and, or } from "drizzle-orm";
import { db } from "../db/index";
import { products, categories, users, salesOrders, purchaseOrders } from "../db/schema/index";

const dashboardRoutes = new Hono();

async function getDashboardAnalytics(days: number = 7) {
    const validDays = [7, 14, 30].includes(days) ? days : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (validDays - 1));
    startDate.setHours(0, 0, 0, 0);

    // Sales query by date
    const salesData = await db
        .select({
            date: sql<string>`TO_CHAR(COALESCE(${salesOrders.completedAt}, ${salesOrders.createdAt}), 'YYYY-MM-DD')`,
            total: sql<string>`COALESCE(SUM(CAST(${salesOrders.totalAmount} AS NUMERIC)), 0)`,
            count: sql<number>`count(*)::int`,
        })
        .from(salesOrders)
        .where(
            and(
                eq(salesOrders.status, "COMPLETED"),
                gte(salesOrders.createdAt, startDate)
            )
        )
        .groupBy(sql`TO_CHAR(COALESCE(${salesOrders.completedAt}, ${salesOrders.createdAt}), 'YYYY-MM-DD')`);

    // Purchase query by date
    const purchaseData = await db
        .select({
            date: sql<string>`TO_CHAR(COALESCE(${purchaseOrders.receivedAt}, ${purchaseOrders.createdAt}), 'YYYY-MM-DD')`,
            total: sql<string>`COALESCE(SUM(CAST(${purchaseOrders.totalAmount} AS NUMERIC)), 0)`,
            count: sql<number>`count(*)::int`,
        })
        .from(purchaseOrders)
        .where(
            and(
                or(eq(purchaseOrders.status, "RECEIVED"), eq(purchaseOrders.status, "DRAFT")),
                gte(purchaseOrders.createdAt, startDate)
            )
        )
        .groupBy(sql`TO_CHAR(COALESCE(${purchaseOrders.receivedAt}, ${purchaseOrders.createdAt}), 'YYYY-MM-DD')`);

    // Overall financial aggregates
    const [realizedSales] = await db
        .select({
            total: sql<string>`COALESCE(SUM(CAST(${salesOrders.totalAmount} AS NUMERIC)), 0)`,
        })
        .from(salesOrders)
        .where(eq(salesOrders.status, "COMPLETED"));

    const [totalPurchases] = await db
        .select({
            total: sql<string>`COALESCE(SUM(CAST(${purchaseOrders.totalAmount} AS NUMERIC)), 0)`,
        })
        .from(purchaseOrders)
        .where(eq(purchaseOrders.status, "RECEIVED"));

    const [inventoryValRes] = await db
        .select({
            total: sql<string>`COALESCE(SUM(CAST(${products.purchasePrice} AS NUMERIC) * ${products.stock}), 0)`,
        })
        .from(products);

    const [potentialRevRes] = await db
        .select({
            total: sql<string>`COALESCE(SUM(CAST(${products.sellingPrice} AS NUMERIC) * ${products.stock}), 0)`,
        })
        .from(products);

    const salesMap = new Map<string, number>();
    for (const item of salesData) {
        if (item.date) salesMap.set(item.date, Number(item.total));
    }

    const purchaseMap = new Map<string, number>();
    for (const item of purchaseData) {
        if (item.date) purchaseMap.set(item.date, Number(item.total));
    }

    // Generate date sequence
    const trend = [];
    let totalSalesPeriod = 0;
    let totalPurchasesPeriod = 0;

    for (let i = 0; i < validDays; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const dateKey = `${yyyy}-${mm}-${dd}`;

        const dayName = d.toLocaleDateString("id-ID", { weekday: "short" });
        const label = d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });

        const s = salesMap.get(dateKey) ?? 0;
        const p = purchaseMap.get(dateKey) ?? 0;

        totalSalesPeriod += s;
        totalPurchasesPeriod += p;

        trend.push({
            date: dateKey,
            label,
            dayName,
            sales: s,
            purchases: p,
        });
    }

    const inventoryValue = Number(inventoryValRes?.total ?? 0);
    const potentialRevenue = Number(potentialRevRes?.total ?? 0);
    const realizedRevenue = Number(realizedSales?.total ?? 0);
    const actualPurchases = Number(totalPurchases?.total ?? 0);
    const estimatedMargin = potentialRevenue - inventoryValue;
    const marginPercentage = inventoryValue > 0 ? (estimatedMargin / inventoryValue) * 100 : 0;
    const realizationRate = potentialRevenue > 0 ? (realizedRevenue / potentialRevenue) * 100 : 0;

    return {
        days: validDays,
        trend,
        summary: {
            totalSalesPeriod,
            totalPurchasesPeriod,
            netCashflow: totalSalesPeriod - totalPurchasesPeriod,
        },
        financialComparison: {
            inventoryValue,
            potentialRevenue,
            realizedRevenue,
            totalPurchases: actualPurchases,
            estimatedMargin,
            marginPercentage: Number(marginPercentage.toFixed(1)),
            realizationRate: Number(realizationRate.toFixed(1)),
        },
    };
}

// Analytics endpoint
dashboardRoutes.get("/analytics", async (c) => {
    try {
        const daysParam = c.req.query("days");
        const days = daysParam ? parseInt(daysParam, 10) : 7;
        const analytics = await getDashboardAnalytics(days);

        return c.json({
            success: true,
            message: "Analytics data retrieved successfully",
            data: analytics,
        }, 200);
    } catch (error) {
        console.error("Analytics error:", error);
        return c.json({
            success: false,
            message: "Failed to fetch analytics data",
        }, 500);
    }
});

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

        // Low stock products based on dynamic minStock rule (0 < stock <= minStock)
        const [lowStockCount] = await db
            .select({ count: count() })
            .from(products)
            .where(sql`${products.stock} <= ${products.minStock} AND ${products.stock} > 0`);

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

        // Fetch analytics
        const analytics = await getDashboardAnalytics(7);

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
                analytics,
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

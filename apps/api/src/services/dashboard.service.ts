import { sql, count, sum, desc, gte, eq, and, or } from "drizzle-orm";
import { db } from "../db/index";
import { products, categories, users, salesOrders, purchaseOrders } from "../db/schema/index";

export class DashboardService {
    // Tren analitik harian penjualan, pembelian, dan metrik finansial
    static async getAnalytics(days: number = 7) {
        const validDays = [7, 14, 30].includes(days) ? days : 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (validDays - 1));
        startDate.setHours(0, 0, 0, 0);

        // Eksekusi query agregasi secara paralel untuk kecepatan maksimal
        const [
            salesData,
            purchaseData,
            [realizedSales],
            [totalPurchases],
            [inventoryValRes],
            [potentialRevRes],
        ] = await Promise.all([
            db
                .select({
                    date: sql<string>`TO_CHAR(COALESCE(${salesOrders.completedAt}, ${salesOrders.createdAt}), 'YYYY-MM-DD')`,
                    total: sql<string>`COALESCE(SUM(CAST(${salesOrders.totalAmount} AS NUMERIC)), 0)`,
                    count: sql<number>`count(*)::int`,
                })
                .from(salesOrders)
                .where(and(eq(salesOrders.status, "COMPLETED"), gte(salesOrders.createdAt, startDate)))
                .groupBy(sql`TO_CHAR(COALESCE(${salesOrders.completedAt}, ${salesOrders.createdAt}), 'YYYY-MM-DD')`),

            db
                .select({
                    date: sql<string>`TO_CHAR(COALESCE(${purchaseOrders.receivedAt}, ${purchaseOrders.createdAt}), 'YYYY-MM-DD')`,
                    total: sql<string>`COALESCE(SUM(CAST(${purchaseOrders.totalAmount} AS NUMERIC)), 0)`,
                    count: sql<number>`count(*)::int`,
                })
                .from(purchaseOrders)
                .where(and(or(eq(purchaseOrders.status, "RECEIVED"), eq(purchaseOrders.status, "DRAFT")), gte(purchaseOrders.createdAt, startDate)))
                .groupBy(sql`TO_CHAR(COALESCE(${purchaseOrders.receivedAt}, ${purchaseOrders.createdAt}), 'YYYY-MM-DD')`),

            db.select({ total: sql<string>`COALESCE(SUM(CAST(${salesOrders.totalAmount} AS NUMERIC)), 0)` })
                .from(salesOrders)
                .where(eq(salesOrders.status, "COMPLETED")),

            db.select({ total: sql<string>`COALESCE(SUM(CAST(${purchaseOrders.totalAmount} AS NUMERIC)), 0)` })
                .from(purchaseOrders)
                .where(eq(purchaseOrders.status, "RECEIVED")),

            db.select({ total: sql<string>`COALESCE(SUM(CAST(${products.purchasePrice} AS NUMERIC) * ${products.stock}), 0)` }).from(products),
            db.select({ total: sql<string>`COALESCE(SUM(CAST(${products.sellingPrice} AS NUMERIC) * ${products.stock}), 0)` }).from(products),
        ]);

        const salesMap = new Map<string, number>();
        for (const item of salesData) {
            if (item.date) salesMap.set(item.date, Number(item.total));
        }

        const purchaseMap = new Map<string, number>();
        for (const item of purchaseData) {
            if (item.date) purchaseMap.set(item.date, Number(item.total));
        }

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

            const s = salesMap.get(dateKey) ?? 0;
            const p = purchaseMap.get(dateKey) ?? 0;
            totalSalesPeriod += s;
            totalPurchasesPeriod += p;

            trend.push({
                date: dateKey,
                label: d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
                dayName: d.toLocaleDateString("id-ID", { weekday: "short" }),
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

    // Ringkasan data overview dashboard utama (KPI & grafik)
    static async getOverview() {
        // Ambil seluruh metrik ringkasan dan produk terbaru secara paralel
        const [
            [productCount],
            [categoryCount],
            [userCount],
            [stockSum],
            [inventoryValue],
            [revenueValue],
            [lowStockCount],
            [outOfStockCount],
            recentProducts,
            analytics,
        ] = await Promise.all([
            db.select({ count: count() }).from(products),
            db.select({ count: count() }).from(categories),
            db.select({ count: count() }).from(users),
            db.select({ total: sum(products.stock) }).from(products),
            db.select({ total: sql<string>`COALESCE(SUM(CAST(${products.purchasePrice} AS NUMERIC) * ${products.stock}), 0)` }).from(products),
            db.select({ total: sql<string>`COALESCE(SUM(CAST(${products.sellingPrice} AS NUMERIC) * ${products.stock}), 0)` }).from(products),
            db.select({ count: count() }).from(products).where(sql`${products.stock} <= ${products.minStock} AND ${products.stock} > 0`),
            db.select({ count: count() }).from(products).where(sql`${products.stock} = 0`),
            db.select({
                id: products.id,
                sku: products.sku,
                name: products.name,
                sellingPrice: products.sellingPrice,
                stock: products.stock,
                createdAt: products.createdAt,
            }).from(products).orderBy(desc(products.createdAt)).limit(5),
            DashboardService.getAnalytics(7),
        ]);

        return {
            totalProducts: productCount?.count ?? 0,
            totalCategories: categoryCount?.count ?? 0,
            totalUsers: userCount?.count ?? 0,
            totalStock: Number(stockSum?.total ?? 0),
            inventoryValue: Number(inventoryValue?.total ?? 0),
            potentialRevenue: Number(revenueValue?.total ?? 0),
            lowStockCount: lowStockCount?.count ?? 0,
            outOfStockCount: outOfStockCount?.count ?? 0,
            recentProducts,
            analytics,
        };
    }
}

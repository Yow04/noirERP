import { eq, desc, sql, and, or, ilike, gte } from "drizzle-orm";
import { db } from "../db";
import {
    salesOrders,
    salesOrderItems,
    products,
} from "../db/schema";
import { InventoryService } from "./inventory.service";

export type SalesStatus = "DRAFT" | "COMPLETED" | "CANCELLED";

type CreateSalesOrderParams = {
    customerName?: string | null;
    notes?: string | null;
    items: {
        productId: string;
        quantity: number;
        unitPrice: number;
    }[];
};

export class SalesService {
    /**
     * Generate nomor SO otomatis: SO-YYYYMMDD-XXXX
     */
    static async generateOrderNumber(): Promise<string> {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
        const prefix = `SO-${dateStr}`;

        const [result] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(salesOrders)
            .where(ilike(salesOrders.orderNumber, `${prefix}%`));

        const seq = (result?.count ?? 0) + 1;
        return `${prefix}-${String(seq).padStart(4, "0")}`;
    }

    /**
     * Buat Sales Order baru (status DRAFT)
     * Validasi ketersediaan stok di tahap ini
     */
    static async createSalesOrder(params: CreateSalesOrderParams) {
        return await db.transaction(async (tx) => {
            const orderNumber = await SalesService.generateOrderNumber();

            // Validasi stok cukup untuk semua item
            for (const item of params.items) {
                const [product] = await tx
                    .select({ id: products.id, name: products.name, stock: products.stock })
                    .from(products)
                    .where(eq(products.id, item.productId))
                    .limit(1);

                if (!product) {
                    throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan.`);
                }

                if (product.stock < item.quantity) {
                    throw new Error(
                        `Stok "${product.name}" tidak mencukupi. Tersedia: ${product.stock}, diminta: ${item.quantity}.`
                    );
                }
            }

            // Hitung total
            let totalAmount = 0;
            const itemsWithSubtotal = params.items.map((item) => {
                const subtotal = item.quantity * item.unitPrice;
                totalAmount += subtotal;
                return { ...item, subtotal };
            });

            // Insert header SO
            const [so] = await tx
                .insert(salesOrders)
                .values({
                    orderNumber,
                    customerName: params.customerName || null,
                    status: "DRAFT",
                    notes: params.notes || null,
                    totalAmount: totalAmount.toFixed(2),
                })
                .returning();

            // Insert items
            const insertedItems = await tx
                .insert(salesOrderItems)
                .values(
                    itemsWithSubtotal.map((item) => ({
                        salesOrderId: so.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice.toFixed(2),
                        subtotal: item.subtotal.toFixed(2),
                    }))
                )
                .returning();

            return { ...so, items: insertedItems };
        });
    }

    /**
     * Konfirmasi penjualan → status COMPLETED, stok berkurang via InventoryService
     */
    static async completeSalesOrder(id: string) {
        return await db.transaction(async (tx) => {
            // 1. Ambil SO
            const [so] = await tx
                .select()
                .from(salesOrders)
                .where(eq(salesOrders.id, id))
                .limit(1);

            if (!so) throw new Error("Sales Order tidak ditemukan.");
            if (so.status === "COMPLETED") throw new Error("SO sudah dikonfirmasi sebelumnya.");
            if (so.status === "CANCELLED") throw new Error("SO sudah dibatalkan, tidak bisa dikonfirmasi.");

            // 2. Ambil items SO
            const items = await tx
                .select()
                .from(salesOrderItems)
                .where(eq(salesOrderItems.salesOrderId, id));

            if (items.length === 0) throw new Error("SO tidak memiliki item.");

            // 3. Loop items → recordMutation(type: OUT) pakai tx yang sama
            const mutationResults = [];
            for (const item of items) {
                const result = await InventoryService.recordMutation(
                    {
                        productId: item.productId,
                        type: "OUT",
                        quantity: item.quantity,
                        reference: `SO:${so.orderNumber}`,
                        notes: `Penjualan dari SO ${so.orderNumber}`,
                    },
                    tx
                );
                mutationResults.push(result);
            }

            // 4. Update status SO → COMPLETED
            const [updatedSO] = await tx
                .update(salesOrders)
                .set({
                    status: "COMPLETED",
                    completedAt: new Date(),
                    updatedAt: new Date(),
                })
                .where(eq(salesOrders.id, id))
                .returning();

            return { order: updatedSO, items, mutations: mutationResults };
        });
    }

    /**
     * Batalkan SO (hanya bisa jika masih DRAFT)
     */
    static async cancelSalesOrder(id: string) {
        return await db.transaction(async (tx) => {
            const [so] = await tx
                .select()
                .from(salesOrders)
                .where(eq(salesOrders.id, id))
                .limit(1);

            if (!so) throw new Error("Sales Order tidak ditemukan.");
            if (so.status !== "DRAFT") {
                throw new Error(`SO dengan status "${so.status}" tidak bisa dibatalkan. Hanya SO DRAFT yang bisa dibatalkan.`);
            }

            const [cancelled] = await tx
                .update(salesOrders)
                .set({
                    status: "CANCELLED",
                    updatedAt: new Date(),
                })
                .where(eq(salesOrders.id, id))
                .returning();

            return cancelled;
        });
    }

    /**
     * Daftar SO dengan filter & pagination
     */
    static async listSalesOrders(filters: {
        status?: string;
        search?: string;
        page?: number;
        limit?: number;
    }) {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 20;
        const offset = (page - 1) * limit;

        const conditions = [];

        if (filters.status && filters.status !== "all") {
            conditions.push(eq(salesOrders.status, filters.status as SalesStatus));
        }

        if (filters.search && filters.search.trim()) {
            const query = `%${filters.search.trim()}%`;
            conditions.push(
                or(
                    ilike(salesOrders.orderNumber, query),
                    ilike(salesOrders.customerName, query),
                    ilike(salesOrders.notes, query)
                )
            );
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const orders = await db
            .select({
                id: salesOrders.id,
                orderNumber: salesOrders.orderNumber,
                customerName: salesOrders.customerName,
                status: salesOrders.status,
                notes: salesOrders.notes,
                totalAmount: salesOrders.totalAmount,
                completedAt: salesOrders.completedAt,
                createdAt: salesOrders.createdAt,
                updatedAt: salesOrders.updatedAt,
            })
            .from(salesOrders)
            .where(whereClause)
            .orderBy(desc(salesOrders.createdAt))
            .limit(limit)
            .offset(offset);

        // Count total for pagination
        const [countResult] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(salesOrders)
            .where(whereClause);

        return {
            data: orders,
            total: countResult?.count ?? 0,
            page,
            limit,
        };
    }

    /**
     * Detail SO dengan items + info produk
     */
    static async getSalesOrderDetail(id: string) {
        const [so] = await db
            .select({
                id: salesOrders.id,
                orderNumber: salesOrders.orderNumber,
                customerName: salesOrders.customerName,
                status: salesOrders.status,
                notes: salesOrders.notes,
                totalAmount: salesOrders.totalAmount,
                completedAt: salesOrders.completedAt,
                createdAt: salesOrders.createdAt,
                updatedAt: salesOrders.updatedAt,
            })
            .from(salesOrders)
            .where(eq(salesOrders.id, id))
            .limit(1);

        if (!so) return null;

        const items = await db
            .select({
                id: salesOrderItems.id,
                productId: salesOrderItems.productId,
                productName: products.name,
                productSku: products.sku,
                quantity: salesOrderItems.quantity,
                unitPrice: salesOrderItems.unitPrice,
                subtotal: salesOrderItems.subtotal,
            })
            .from(salesOrderItems)
            .innerJoin(products, eq(salesOrderItems.productId, products.id))
            .where(eq(salesOrderItems.salesOrderId, id));

        return { ...so, items };
    }

    /**
     * Ringkasan sales untuk KPI
     */
    static async getSummary() {
        const [totalSO] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(salesOrders);

        const [draftSO] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(salesOrders)
            .where(eq(salesOrders.status, "DRAFT"));

        const [completedSO] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(salesOrders)
            .where(eq(salesOrders.status, "COMPLETED"));

        const [totalRevenue] = await db
            .select({
                total: sql<string>`COALESCE(SUM(CAST(${salesOrders.totalAmount} AS NUMERIC)), 0)`,
            })
            .from(salesOrders)
            .where(eq(salesOrders.status, "COMPLETED"));

        // Transaksi hari ini (completed)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [todayCount] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(salesOrders)
            .where(
                and(
                    eq(salesOrders.status, "COMPLETED"),
                    gte(salesOrders.completedAt, todayStart)
                )
            );

        const [todayRevenue] = await db
            .select({
                total: sql<string>`COALESCE(SUM(CAST(${salesOrders.totalAmount} AS NUMERIC)), 0)`,
            })
            .from(salesOrders)
            .where(
                and(
                    eq(salesOrders.status, "COMPLETED"),
                    gte(salesOrders.completedAt, todayStart)
                )
            );

        return {
            totalOrders: totalSO?.count ?? 0,
            draftOrders: draftSO?.count ?? 0,
            completedOrders: completedSO?.count ?? 0,
            totalRevenue: Number(totalRevenue?.total ?? 0),
            todayTransactions: todayCount?.count ?? 0,
            todayRevenue: Number(todayRevenue?.total ?? 0),
        };
    }
}

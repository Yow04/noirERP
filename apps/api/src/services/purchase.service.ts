import { eq, desc, sql, and, or, ilike } from "drizzle-orm";
import { db } from "../db/index";
import {
    purchaseOrders,
    purchaseOrderItems,
    suppliers,
    products,
} from "../db/schema/index";
import { InventoryService } from "./inventory.service";

export type PurchaseStatus = "DRAFT" | "RECEIVED" | "CANCELLED";

type CreatePurchaseOrderParams = {
    supplierId?: string | null;
    notes?: string | null;
    items: {
        productId: string;
        quantity: number;
        unitPrice: number;
    }[];
};

export class PurchaseService {
    static async generateOrderNumber(): Promise<string> {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
        const prefix = `PO-${dateStr}`;

        const [result] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(purchaseOrders)
            .where(ilike(purchaseOrders.orderNumber, `${prefix}%`));

        const seq = (result?.count ?? 0) + 1;
        return `${prefix}-${String(seq).padStart(4, "0")}`;
    }

    static async createPurchaseOrder(params: CreatePurchaseOrderParams) {
        return await db.transaction(async (tx) => {
            const orderNumber = await PurchaseService.generateOrderNumber();

            // Hitung total
            let totalAmount = 0;
            const itemsWithSubtotal = params.items.map((item) => {
                const subtotal = item.quantity * item.unitPrice;
                totalAmount += subtotal;
                return { ...item, subtotal };
            });

            // Insert header PO
            const [po] = await tx
                .insert(purchaseOrders)
                .values({
                    orderNumber,
                    supplierId: params.supplierId || null,
                    status: "DRAFT",
                    notes: params.notes || null,
                    totalAmount: totalAmount.toFixed(2),
                })
                .returning();

            // Insert items
            const insertedItems = await tx
                .insert(purchaseOrderItems)
                .values(
                    itemsWithSubtotal.map((item) => ({
                        purchaseOrderId: po.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice.toFixed(2),
                        subtotal: item.subtotal.toFixed(2),
                    }))
                )
                .returning();

            return { ...po, items: insertedItems };
        });
    }

    static async receivePurchaseOrder(id: string) {
        return await db.transaction(async (tx) => {
            // 1. Ambil PO
            const [po] = await tx
                .select()
                .from(purchaseOrders)
                .where(eq(purchaseOrders.id, id))
                .limit(1);

            if (!po) throw new Error("Purchase Order tidak ditemukan.");
            if (po.status === "RECEIVED") throw new Error("PO sudah diterima sebelumnya.");
            if (po.status === "CANCELLED") throw new Error("PO sudah dibatalkan, tidak bisa diterima.");

            // 2. Ambil items PO
            const items = await tx
                .select()
                .from(purchaseOrderItems)
                .where(eq(purchaseOrderItems.purchaseOrderId, id));

            if (items.length === 0) throw new Error("PO tidak memiliki item.");

            // 3. Loop items → recordMutation(type: IN) pakai tx yang sama
            const mutationResults = [];
            for (const item of items) {
                const result = await InventoryService.recordMutation(
                    {
                        productId: item.productId,
                        type: "IN",
                        quantity: item.quantity,
                        reference: `PO:${po.orderNumber}`,
                        notes: `Penerimaan barang dari PO ${po.orderNumber}`,
                    },
                    tx
                );
                mutationResults.push(result);
            }

            // 4. Update status PO → RECEIVED
            const [updatedPO] = await tx
                .update(purchaseOrders)
                .set({
                    status: "RECEIVED",
                    receivedAt: new Date(),
                    updatedAt: new Date(),
                })
                .where(eq(purchaseOrders.id, id))
                .returning();

            return { order: updatedPO, items, mutations: mutationResults };
        });
    }

    static async cancelPurchaseOrder(id: string) {
        return await db.transaction(async (tx) => {
            const [po] = await tx
                .select()
                .from(purchaseOrders)
                .where(eq(purchaseOrders.id, id))
                .limit(1);

            if (!po) throw new Error("Purchase Order tidak ditemukan.");
            if (po.status !== "DRAFT") {
                throw new Error(`PO dengan status "${po.status}" tidak bisa dibatalkan. Hanya PO DRAFT yang bisa dibatalkan.`);
            }

            const [cancelled] = await tx
                .update(purchaseOrders)
                .set({
                    status: "CANCELLED",
                    updatedAt: new Date(),
                })
                .where(eq(purchaseOrders.id, id))
                .returning();

            return cancelled;
        });
    }

    static async listPurchaseOrders(filters: {
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
            conditions.push(eq(purchaseOrders.status, filters.status as PurchaseStatus));
        }

        if (filters.search && filters.search.trim()) {
            const query = `%${filters.search.trim()}%`;
            conditions.push(
                or(
                    ilike(purchaseOrders.orderNumber, query),
                    ilike(suppliers.name, query),
                    ilike(purchaseOrders.notes, query)
                )
            );
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const orders = await db
            .select({
                id: purchaseOrders.id,
                orderNumber: purchaseOrders.orderNumber,
                supplierId: purchaseOrders.supplierId,
                supplierName: suppliers.name,
                status: purchaseOrders.status,
                notes: purchaseOrders.notes,
                totalAmount: purchaseOrders.totalAmount,
                receivedAt: purchaseOrders.receivedAt,
                createdAt: purchaseOrders.createdAt,
                updatedAt: purchaseOrders.updatedAt,
            })
            .from(purchaseOrders)
            .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
            .where(whereClause)
            .orderBy(desc(purchaseOrders.createdAt))
            .limit(limit)
            .offset(offset);

        // Count total for pagination
        const [countResult] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(purchaseOrders)
            .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
            .where(whereClause);

        return {
            data: orders,
            total: countResult?.count ?? 0,
            page,
            limit,
        };
    }

    static async getPurchaseOrderDetail(id: string) {
        const [po] = await db
            .select({
                id: purchaseOrders.id,
                orderNumber: purchaseOrders.orderNumber,
                supplierId: purchaseOrders.supplierId,
                supplierName: suppliers.name,
                supplierPhone: suppliers.phone,
                supplierEmail: suppliers.email,
                status: purchaseOrders.status,
                notes: purchaseOrders.notes,
                totalAmount: purchaseOrders.totalAmount,
                receivedAt: purchaseOrders.receivedAt,
                createdAt: purchaseOrders.createdAt,
                updatedAt: purchaseOrders.updatedAt,
            })
            .from(purchaseOrders)
            .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
            .where(eq(purchaseOrders.id, id))
            .limit(1);

        if (!po) return null;

        const items = await db
            .select({
                id: purchaseOrderItems.id,
                productId: purchaseOrderItems.productId,
                productName: products.name,
                productSku: products.sku,
                quantity: purchaseOrderItems.quantity,
                unitPrice: purchaseOrderItems.unitPrice,
                subtotal: purchaseOrderItems.subtotal,
            })
            .from(purchaseOrderItems)
            .innerJoin(products, eq(purchaseOrderItems.productId, products.id))
            .where(eq(purchaseOrderItems.purchaseOrderId, id));

        return { ...po, items };
    }

    static async getSummary() {
        const [
            [totalPO],
            [draftPO],
            [receivedPO],
            [totalValue],
        ] = await Promise.all([
            db.select({ count: sql<number>`count(*)::int` }).from(purchaseOrders),
            db.select({ count: sql<number>`count(*)::int` }).from(purchaseOrders).where(eq(purchaseOrders.status, "DRAFT")),
            db.select({ count: sql<number>`count(*)::int` }).from(purchaseOrders).where(eq(purchaseOrders.status, "RECEIVED")),
            db.select({ total: sql<string>`COALESCE(SUM(CAST(${purchaseOrders.totalAmount} AS NUMERIC)), 0)` }).from(purchaseOrders).where(eq(purchaseOrders.status, "RECEIVED")),
        ]);

        return {
            totalOrders: totalPO?.count ?? 0,
            draftOrders: draftPO?.count ?? 0,
            receivedOrders: receivedPO?.count ?? 0,
            totalPurchaseValue: Number(totalValue?.total ?? 0),
        };
    }

    static async listSuppliers() {
        return await db
            .select()
            .from(suppliers)
            .orderBy(suppliers.name);
    }

    static async createSupplier(data: {
        name: string;
        contactPerson?: string | null;
        phone?: string | null;
        email?: string | null;
        address?: string | null;
    }) {
        const [newSupplier] = await db
            .insert(suppliers)
            .values({
                name: data.name,
                contactPerson: data.contactPerson || null,
                phone: data.phone || null,
                email: data.email || null,
                address: data.address || null,
            })
            .returning();
        return newSupplier;
    }
}


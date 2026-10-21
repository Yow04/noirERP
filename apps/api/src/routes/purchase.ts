import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { PurchaseService } from "../services/purchase.service";
import {
    createPurchaseOrderSchema,
    purchaseFilterSchema,
} from "../validator/validator.purchase";
import { authMiddleware } from "../middleware/auth";

const purchaseRoutes = new Hono();

// Seluruh route purchasing memerlukan autentikasi
purchaseRoutes.use("*", authMiddleware);

// GET /api/v1/purchases/summary
// Ringkasan data purchasing (Total PO, PO Draft, Total nilai pembelian)
purchaseRoutes.get("/summary", async (c) => {
    try {
        const summary = await PurchaseService.getSummary();
        return c.json({
            success: true,
            message: "Ringkasan pembelian berhasil diambil",
            data: summary,
        }, 200);
    } catch (error) {
        console.error("Gagal mengambil ringkasan pembelian:", error);
        return c.json({
            success: false,
            message: "Gagal mengambil ringkasan pembelian",
            error: error instanceof Error ? error.message : String(error),
        }, 500);
    }
});

// GET /api/v1/purchases/suppliers
// Daftar supplier
purchaseRoutes.get("/suppliers", async (c) => {
    try {
        const supplierList = await PurchaseService.listSuppliers();
        return c.json({
            success: true,
            message: "Daftar supplier berhasil diambil",
            data: supplierList,
        }, 200);
    } catch (error) {
        console.error("Gagal mengambil supplier:", error);
        return c.json({
            success: false,
            message: "Gagal mengambil supplier",
            error: error instanceof Error ? error.message : String(error),
        }, 500);
    }
});

// POST /api/v1/purchases/suppliers
// Tambah supplier baru
purchaseRoutes.post("/suppliers", async (c) => {
    try {
        const body = await c.req.json();
        if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
            return c.json({ success: false, message: "Nama supplier wajib diisi" }, 400);
        }
        const supplier = await PurchaseService.createSupplier({
            name: body.name.trim(),
            contactPerson: body.contactPerson?.trim() || null,
            phone: body.phone?.trim() || null,
            email: body.email?.trim() || null,
            address: body.address?.trim() || null,
        });
        return c.json({
            success: true,
            message: "Supplier berhasil ditambahkan",
            data: supplier,
        }, 201);
    } catch (error) {
        console.error("Gagal membuat supplier:", error);
        return c.json({
            success: false,
            message: "Gagal membuat supplier",
            error: error instanceof Error ? error.message : String(error),
        }, 500);
    }
});

// GET /api/v1/purchases
// Daftar purchase orders dengan filter & pagination
purchaseRoutes.get("/", zValidator("query", purchaseFilterSchema), async (c) => {
    const filters = c.req.valid("query");

    try {
        const result = await PurchaseService.listPurchaseOrders(filters);
        return c.json({
            success: true,
            message: "Daftar purchase order berhasil diambil",
            ...result,
        }, 200);
    } catch (error) {
        console.error("Gagal mengambil daftar PO:", error);
        return c.json({
            success: false,
            message: "Gagal mengambil daftar purchase order",
            error: error instanceof Error ? error.message : String(error),
        }, 500);
    }
});

// GET /api/v1/purchases/:id
// Detail purchase order dengan items
purchaseRoutes.get("/:id", async (c) => {
    const id = c.req.param("id");

    try {
        const detail = await PurchaseService.getPurchaseOrderDetail(id);
        if (!detail) {
            return c.json({
                success: false,
                message: "Purchase Order tidak ditemukan",
            }, 404);
        }

        return c.json({
            success: true,
            message: "Detail purchase order berhasil diambil",
            data: detail,
        }, 200);
    } catch (error) {
        console.error("Gagal mengambil detail PO:", error);
        return c.json({
            success: false,
            message: "Gagal mengambil detail purchase order",
            error: error instanceof Error ? error.message : String(error),
        }, 500);
    }
});

// POST /api/v1/purchases
// Buat purchase order baru (DRAFT)
purchaseRoutes.post(
    "/",
    zValidator("json", createPurchaseOrderSchema),
    async (c) => {
        const body = c.req.valid("json");

        try {
            const result = await PurchaseService.createPurchaseOrder({
                supplierId: body.supplierId,
                notes: body.notes,
                items: body.items,
            });

            return c.json({
                success: true,
                message: "Purchase Order berhasil dibuat",
                data: result,
            }, 201);
        } catch (error) {
            console.error("Gagal membuat PO:", error);
            const message = error instanceof Error ? error.message : "Gagal membuat purchase order";
            return c.json({
                success: false,
                message,
            }, 400);
        }
    }
);

// PATCH /api/v1/purchases/:id/receive
// Terima barang dari PO → stok bertambah
purchaseRoutes.patch("/:id/receive", async (c) => {
    const id = c.req.param("id");

    try {
        const result = await PurchaseService.receivePurchaseOrder(id);
        return c.json({
            success: true,
            message: `PO ${result.order.orderNumber} berhasil diterima. Stok telah diperbarui.`,
            data: result,
        }, 200);
    } catch (error) {
        console.error("Gagal menerima PO:", error);
        const message = error instanceof Error ? error.message : "Gagal menerima purchase order";
        return c.json({
            success: false,
            message,
        }, 400);
    }
});

// PATCH /api/v1/purchases/:id/cancel
// Batalkan PO (hanya DRAFT)
purchaseRoutes.patch("/:id/cancel", async (c) => {
    const id = c.req.param("id");

    try {
        const result = await PurchaseService.cancelPurchaseOrder(id);
        return c.json({
            success: true,
            message: `PO ${result.orderNumber} berhasil dibatalkan.`,
            data: result,
        }, 200);
    } catch (error) {
        console.error("Gagal membatalkan PO:", error);
        const message = error instanceof Error ? error.message : "Gagal membatalkan purchase order";
        return c.json({
            success: false,
            message,
        }, 400);
    }
});

export default purchaseRoutes;

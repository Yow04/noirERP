import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { PurchaseService } from "../services/purchase.service";
import {
    createPurchaseOrderSchema,
    purchaseFilterSchema,
} from "../validator/validator.purchase";
import { authMiddleware } from "../middleware/auth";
import { sendSuccess, sendError } from "../lib/response";

const purchaseRoutes = new Hono();

// Seluruh route purchasing memerlukan autentikasi
purchaseRoutes.use("*", authMiddleware);

// GET /api/v1/purchases/summary
// Ringkasan data purchasing (Total PO, PO Draft, Total nilai pembelian)
purchaseRoutes.get("/summary", async (c) => {
    try {
        const summary = await PurchaseService.getSummary();
        return sendSuccess(c, summary, "Ringkasan pembelian berhasil diambil");
    } catch (error) {
        console.error("Gagal mengambil ringkasan pembelian:", error);
        return sendError(c, "Gagal mengambil ringkasan pembelian", 500, error);
    }
});

// GET /api/v1/purchases/suppliers
// Daftar supplier
purchaseRoutes.get("/suppliers", async (c) => {
    try {
        const supplierList = await PurchaseService.listSuppliers();
        return sendSuccess(c, supplierList, "Daftar supplier berhasil diambil");
    } catch (error) {
        console.error("Gagal mengambil supplier:", error);
        return sendError(c, "Gagal mengambil supplier", 500, error);
    }
});

// POST /api/v1/purchases/suppliers
// Tambah supplier baru
purchaseRoutes.post("/suppliers", async (c) => {
    try {
        const body = await c.req.json();
        if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
            return sendError(c, "Nama supplier wajib diisi", 400);
        }
        const supplier = await PurchaseService.createSupplier({
            name: body.name.trim(),
            contactPerson: body.contactPerson?.trim() || null,
            phone: body.phone?.trim() || null,
            email: body.email?.trim() || null,
            address: body.address?.trim() || null,
        });
        return sendSuccess(c, supplier, "Supplier berhasil ditambahkan", 201);
    } catch (error) {
        console.error("Gagal membuat supplier:", error);
        return sendError(c, "Gagal membuat supplier", 500, error);
    }
});

// GET /api/v1/purchases
// Daftar purchase orders dengan filter & pagination
purchaseRoutes.get("/", zValidator("query", purchaseFilterSchema), async (c) => {
    const filters = c.req.valid("query");

    try {
        const result = await PurchaseService.listPurchaseOrders(filters);
        return sendSuccess(c, result.data, "Daftar purchase order berhasil diambil", 200, {
            total: result.total,
            page: result.page,
            limit: result.limit,
        });
    } catch (error) {
        console.error("Gagal mengambil daftar PO:", error);
        return sendError(c, "Gagal mengambil daftar purchase order", 500, error);
    }
});

// GET /api/v1/purchases/:id
// Detail purchase order dengan items
purchaseRoutes.get("/:id", async (c) => {
    const id = c.req.param("id");
    if (!id) {
        return sendError(c, "ID Purchase Order diperlukan", 400);
    }

    try {
        const detail = await PurchaseService.getPurchaseOrderDetail(id);
        if (!detail) {
            return sendError(c, "Purchase Order tidak ditemukan", 404);
        }

        return sendSuccess(c, detail, "Detail purchase order berhasil diambil");
    } catch (error) {
        console.error("Gagal mengambil detail PO:", error);
        return sendError(c, "Gagal mengambil detail purchase order", 500, error);
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

            return sendSuccess(c, result, "Purchase Order berhasil dibuat", 201);
        } catch (error) {
            console.error("Gagal membuat PO:", error);
            const message = error instanceof Error ? error.message : "Gagal membuat purchase order";
            return sendError(c, message, 400, error);
        }
    }
);

// PATCH /api/v1/purchases/:id/receive
// Terima barang dari PO → stok bertambah
purchaseRoutes.patch("/:id/receive", async (c) => {
    const id = c.req.param("id");
    if (!id) {
        return sendError(c, "ID Purchase Order diperlukan", 400);
    }

    try {
        const result = await PurchaseService.receivePurchaseOrder(id);
        return sendSuccess(c, result, `PO ${result.order.orderNumber} berhasil diterima. Stok telah diperbarui.`);
    } catch (error) {
        console.error("Gagal menerima PO:", error);
        const message = error instanceof Error ? error.message : "Gagal menerima purchase order";
        return sendError(c, message, 400, error);
    }
});

// PATCH /api/v1/purchases/:id/cancel
// Batalkan PO (hanya DRAFT)
purchaseRoutes.patch("/:id/cancel", async (c) => {
    const id = c.req.param("id");
    if (!id) {
        return sendError(c, "ID Purchase Order diperlukan", 400);
    }

    try {
        const result = await PurchaseService.cancelPurchaseOrder(id);
        return sendSuccess(c, result, `PO ${result.orderNumber} berhasil dibatalkan.`);
    } catch (error) {
        console.error("Gagal membatalkan PO:", error);
        const message = error instanceof Error ? error.message : "Gagal membatalkan purchase order";
        return sendError(c, message, 400, error);
    }
});

export default purchaseRoutes;

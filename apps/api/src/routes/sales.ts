import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { SalesService } from "../services/sales.service";
import {
    createSalesOrderSchema,
    salesFilterSchema,
} from "../validator/validator.sales";
import { authMiddleware } from "../middleware/auth";
import { sendSuccess, sendError } from "../lib/response";

const salesRoutes = new Hono();

// Seluruh route penjualan memerlukan autentikasi
salesRoutes.use("*", authMiddleware);

// GET /api/v1/sales/summary
// Ringkasan data sales (Total SO, Revenue, Transaksi hari ini)
salesRoutes.get("/summary", async (c) => {
    try {
        const summary = await SalesService.getSummary();
        return sendSuccess(c, summary, "Ringkasan penjualan berhasil diambil");
    } catch (error) {
        console.error("Gagal mengambil ringkasan penjualan:", error);
        return sendError(c, "Gagal mengambil ringkasan penjualan", 500, error);
    }
});

// GET /api/v1/sales
// Daftar sales orders dengan filter & pagination
salesRoutes.get("/", zValidator("query", salesFilterSchema), async (c) => {
    const filters = c.req.valid("query");

    try {
        const result = await SalesService.listSalesOrders(filters);
        return sendSuccess(c, result.data, "Daftar sales order berhasil diambil", 200, {
            total: result.total,
            page: result.page,
            limit: result.limit,
        });
    } catch (error) {
        console.error("Gagal mengambil daftar SO:", error);
        return sendError(c, "Gagal mengambil daftar sales order", 500, error);
    }
});

// GET /api/v1/sales/:id
// Detail sales order dengan items
salesRoutes.get("/:id", async (c) => {
    const id = c.req.param("id");
    if (!id) {
        return sendError(c, "ID Sales Order diperlukan", 400);
    }

    try {
        const detail = await SalesService.getSalesOrderDetail(id);
        if (!detail) {
            return sendError(c, "Sales Order tidak ditemukan", 404);
        }

        return sendSuccess(c, detail, "Detail sales order berhasil diambil");
    } catch (error) {
        console.error("Gagal mengambil detail SO:", error);
        return sendError(c, "Gagal mengambil detail sales order", 500, error);
    }
});

// POST /api/v1/sales
// Buat sales order baru (DRAFT)
salesRoutes.post(
    "/",
    zValidator("json", createSalesOrderSchema),
    async (c) => {
        const body = c.req.valid("json");

        try {
            const result = await SalesService.createSalesOrder({
                customerName: body.customerName,
                notes: body.notes,
                items: body.items,
            });

            return sendSuccess(c, result, "Sales Order berhasil dibuat", 201);
        } catch (error) {
            console.error("Gagal membuat SO:", error);
            const message = error instanceof Error ? error.message : "Gagal membuat sales order";
            return sendError(c, message, 400, error);
        }
    }
);

// PATCH /api/v1/sales/:id/complete
// Konfirmasi penjualan → stok berkurang
salesRoutes.patch("/:id/complete", async (c) => {
    const id = c.req.param("id");
    if (!id) {
        return sendError(c, "ID Sales Order diperlukan", 400);
    }

    try {
        const result = await SalesService.completeSalesOrder(id);
        return sendSuccess(c, result, `SO ${result.order.orderNumber} berhasil dikonfirmasi. Stok telah diperbarui.`);
    } catch (error) {
        console.error("Gagal mengkonfirmasi SO:", error);
        const message = error instanceof Error ? error.message : "Gagal mengkonfirmasi sales order";
        return sendError(c, message, 400, error);
    }
});

// PATCH /api/v1/sales/:id/cancel
// Batalkan SO (hanya DRAFT)
salesRoutes.patch("/:id/cancel", async (c) => {
    const id = c.req.param("id");
    if (!id) {
        return sendError(c, "ID Sales Order diperlukan", 400);
    }

    try {
        const result = await SalesService.cancelSalesOrder(id);
        return sendSuccess(c, result, `SO ${result.orderNumber} berhasil dibatalkan.`);
    } catch (error) {
        console.error("Gagal membatalkan SO:", error);
        const message = error instanceof Error ? error.message : "Gagal membatalkan sales order";
        return sendError(c, message, 400, error);
    }
});

export default salesRoutes;

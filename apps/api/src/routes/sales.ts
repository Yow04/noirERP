import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { SalesService } from "../services/sales.service";
import {
    createSalesOrderSchema,
    salesFilterSchema,
} from "../validator/validator.sales";

const salesRoutes = new Hono();

// GET /api/v1/sales/summary
// Ringkasan data sales (Total SO, Revenue, Transaksi hari ini)
salesRoutes.get("/summary", async (c) => {
    try {
        const summary = await SalesService.getSummary();
        return c.json({
            success: true,
            message: "Ringkasan penjualan berhasil diambil",
            data: summary,
        }, 200);
    } catch (error) {
        console.error("Gagal mengambil ringkasan penjualan:", error);
        return c.json({
            success: false,
            message: "Gagal mengambil ringkasan penjualan",
            error: error instanceof Error ? error.message : String(error),
        }, 500);
    }
});

// GET /api/v1/sales
// Daftar sales orders dengan filter & pagination
salesRoutes.get("/", zValidator("query", salesFilterSchema), async (c) => {
    const filters = c.req.valid("query");

    try {
        const result = await SalesService.listSalesOrders(filters);
        return c.json({
            success: true,
            message: "Daftar sales order berhasil diambil",
            ...result,
        }, 200);
    } catch (error) {
        console.error("Gagal mengambil daftar SO:", error);
        return c.json({
            success: false,
            message: "Gagal mengambil daftar sales order",
            error: error instanceof Error ? error.message : String(error),
        }, 500);
    }
});

// GET /api/v1/sales/:id
// Detail sales order dengan items
salesRoutes.get("/:id", async (c) => {
    const id = c.req.param("id");

    try {
        const detail = await SalesService.getSalesOrderDetail(id);
        if (!detail) {
            return c.json({
                success: false,
                message: "Sales Order tidak ditemukan",
            }, 404);
        }

        return c.json({
            success: true,
            message: "Detail sales order berhasil diambil",
            data: detail,
        }, 200);
    } catch (error) {
        console.error("Gagal mengambil detail SO:", error);
        return c.json({
            success: false,
            message: "Gagal mengambil detail sales order",
            error: error instanceof Error ? error.message : String(error),
        }, 500);
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

            return c.json({
                success: true,
                message: "Sales Order berhasil dibuat",
                data: result,
            }, 201);
        } catch (error) {
            console.error("Gagal membuat SO:", error);
            const message = error instanceof Error ? error.message : "Gagal membuat sales order";
            return c.json({
                success: false,
                message,
            }, 400);
        }
    }
);

// PATCH /api/v1/sales/:id/complete
// Konfirmasi penjualan → stok berkurang
salesRoutes.patch("/:id/complete", async (c) => {
    const id = c.req.param("id");

    try {
        const result = await SalesService.completeSalesOrder(id);
        return c.json({
            success: true,
            message: `SO ${result.order.orderNumber} berhasil dikonfirmasi. Stok telah diperbarui.`,
            data: result,
        }, 200);
    } catch (error) {
        console.error("Gagal mengkonfirmasi SO:", error);
        const message = error instanceof Error ? error.message : "Gagal mengkonfirmasi sales order";
        return c.json({
            success: false,
            message,
        }, 400);
    }
});

// PATCH /api/v1/sales/:id/cancel
// Batalkan SO (hanya DRAFT)
salesRoutes.patch("/:id/cancel", async (c) => {
    const id = c.req.param("id");

    try {
        const result = await SalesService.cancelSalesOrder(id);
        return c.json({
            success: true,
            message: `SO ${result.orderNumber} berhasil dibatalkan.`,
            data: result,
        }, 200);
    } catch (error) {
        console.error("Gagal membatalkan SO:", error);
        const message = error instanceof Error ? error.message : "Gagal membatalkan sales order";
        return c.json({
            success: false,
            message,
        }, 400);
    }
});

export default salesRoutes;

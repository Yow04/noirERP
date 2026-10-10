import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { InventoryService } from "../services/inventory.service";
import {
    createStockMutationSchema,
    updateMinStockSchema,
    inventoryFilterSchema,
    mutationFilterSchema,
} from "../validator/validator.inventory";

const inventoryRoutes = new Hono();

// GET /api/v1/inventory/summary
// Mengambil ringkasan data inventaris (Total SKU, Total unit, Stok Rendah, Stok Habis, Total Mutasi)
inventoryRoutes.get("/summary", async (c) => {
    try {
        const summary = await InventoryService.getSummary();
        return c.json({
            success: true,
            message: "Ringkasan inventaris berhasil diambil",
            data: summary,
        }, 200);
    } catch (error) {
        console.error("Gagal mengambil ringkasan inventaris:", error);
        return c.json({
            success: false,
            message: "Gagal mengambil ringkasan inventaris",
            error: error instanceof Error ? error.message : String(error),
        }, 500);
    }
});

// GET /api/v1/inventory/items
// Mengambil daftar item inventaris beserta aturan stok minimum dan statusnya
inventoryRoutes.get("/items", zValidator("query", inventoryFilterSchema), async (c) => {
    const filters = c.req.valid("query");

    try {
        const items = await InventoryService.getInventoryItems(filters);
        return c.json({
            success: true,
            message: "Daftar inventaris berhasil diambil",
            data: items,
        }, 200);
    } catch (error) {
        console.error("Gagal mengambil daftar inventaris:", error);
        return c.json({
            success: false,
            message: "Gagal mengambil daftar inventaris",
            error: error instanceof Error ? error.message : String(error),
        }, 500);
    }
});

// PATCH /api/v1/inventory/items/:id/min-stock
// Memperbarui aturan stok minimum produk
inventoryRoutes.patch(
    "/items/:id/min-stock",
    zValidator("json", updateMinStockSchema),
    async (c) => {
        const id = c.req.param("id");
        const { minStock } = c.req.valid("json");

        try {
            const updated = await InventoryService.updateMinStock(id, minStock);
            return c.json({
                success: true,
                message: `Aturan stok minimum berhasil diperbarui menjadi ${minStock}`,
                data: updated,
            }, 200);
        } catch (error) {
            console.error("Gagal memperbarui aturan stok minimum:", error);
            const message = error instanceof Error ? error.message : "Gagal memperbarui stok minimum";
            return c.json({
                success: false,
                message,
            }, 400);
        }
    }
);

// GET /api/v1/inventory/mutations
// Mengambil riwayat mutasi stok
inventoryRoutes.get("/mutations", zValidator("query", mutationFilterSchema), async (c) => {
    const filters = c.req.valid("query");

    try {
        const mutations = await InventoryService.getMutations(filters);
        return c.json({
            success: true,
            message: "Riwayat mutasi stok berhasil diambil",
            data: mutations,
        }, 200);
    } catch (error) {
        console.error("Gagal mengambil mutasi stok:", error);
        return c.json({
            success: false,
            message: "Gagal mengambil riwayat mutasi stok",
            error: error instanceof Error ? error.message : String(error),
        }, 500);
    }
});

// POST /api/v1/inventory/mutations
// Mencatat mutasi stok baru (IN, OUT, ADJUSTMENT, INITIAL)
inventoryRoutes.post(
    "/mutations",
    zValidator("json", createStockMutationSchema),
    async (c) => {
        const body = c.req.valid("json");

        try {
            const result = await InventoryService.recordMutation({
                productId: body.productId,
                type: body.type,
                quantity: body.quantity,
                adjustmentMode: body.adjustmentMode,
                reference: body.reference,
                notes: body.notes,
            });

            return c.json({
                success: true,
                message: "Mutasi stok berhasil dicatat",
                data: result,
            }, 201);
        } catch (error) {
            console.error("Gagal mencatat mutasi stok:", error);
            const message = error instanceof Error ? error.message : "Gagal mencatat mutasi stok";
            return c.json({
                success: false,
                message,
            }, 400);
        }
    }
);

export default inventoryRoutes;

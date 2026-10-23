import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { InventoryService } from "../services/inventory.service";
import {
    createStockMutationSchema,
    updateMinStockSchema,
    inventoryFilterSchema,
    mutationFilterSchema,
} from "../validator/validator.inventory";
import { authMiddleware } from "../middleware/auth";
import { sendSuccess, sendError } from "../lib/response";

const inventoryRoutes = new Hono();

// Seluruh route inventori memerlukan autentikasi
inventoryRoutes.use("*", authMiddleware);

// GET /api/v1/inventory/summary
// Mengambil ringkasan data inventaris (Total SKU, Total unit, Stok Rendah, Stok Habis, Total Mutasi)
inventoryRoutes.get("/summary", async (c) => {
    try {
        const summary = await InventoryService.getSummary();
        return sendSuccess(c, summary, "Ringkasan inventaris berhasil diambil");
    } catch (error) {
        console.error("Gagal mengambil ringkasan inventaris:", error);
        return sendError(c, "Gagal mengambil ringkasan inventaris", 500, error);
    }
});

// GET /api/v1/inventory/items
// Mengambil daftar item inventaris beserta aturan stok minimum dan statusnya
inventoryRoutes.get("/items", zValidator("query", inventoryFilterSchema), async (c) => {
    const filters = c.req.valid("query");

    try {
        const items = await InventoryService.getInventoryItems(filters);
        return sendSuccess(c, items, "Daftar inventaris berhasil diambil");
    } catch (error) {
        console.error("Gagal mengambil daftar inventaris:", error);
        return sendError(c, "Gagal mengambil daftar inventaris", 500, error);
    }
});

// PATCH /api/v1/inventory/items/:id/min-stock
// Memperbarui aturan stok minimum produk
inventoryRoutes.patch(
    "/items/:id/min-stock",
    zValidator("json", updateMinStockSchema),
    async (c) => {
        const id = c.req.param("id");
        if (!id) {
            return sendError(c, "ID produk diperlukan", 400);
        }
        const { minStock } = c.req.valid("json");

        try {
            const updated = await InventoryService.updateMinStock(id, minStock);
            return sendSuccess(c, updated, `Aturan stok minimum berhasil diperbarui menjadi ${minStock}`);
        } catch (error) {
            console.error("Gagal memperbarui aturan stok minimum:", error);
            const message = error instanceof Error ? error.message : "Gagal memperbarui stok minimum";
            return sendError(c, message, 400, error);
        }
    }
);

// GET /api/v1/inventory/mutations
// Mengambil riwayat mutasi stok
inventoryRoutes.get("/mutations", zValidator("query", mutationFilterSchema), async (c) => {
    const filters = c.req.valid("query");

    try {
        const mutations = await InventoryService.getMutations(filters);
        return sendSuccess(c, mutations, "Riwayat mutasi stok berhasil diambil");
    } catch (error) {
        console.error("Gagal mengambil mutasi stok:", error);
        return sendError(c, "Gagal mengambil riwayat mutasi stok", 500, error);
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

            return sendSuccess(c, result, "Mutasi stok berhasil dicatat", 201);
        } catch (error) {
            console.error("Gagal mencatat mutasi stok:", error);
            const message = error instanceof Error ? error.message : "Gagal mencatat mutasi stok";
            return sendError(c, message, 400, error);
        }
    }
);

export default inventoryRoutes;

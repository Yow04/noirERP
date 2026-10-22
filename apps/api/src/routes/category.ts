import { Hono } from "hono";
import { CategoryService } from "../services/category.service";
import { authMiddleware } from "../middleware/auth";
import { sendSuccess, sendError } from "../lib/response";

const categoryRoutes = new Hono();

// Seluruh route kategori memerlukan autentikasi
categoryRoutes.use("*", authMiddleware);

// GET /api/v1/categories - Mengambil seluruh kategori
categoryRoutes.get("/", async (c) => {
    try {
        const result = await CategoryService.getAll();
        return sendSuccess(c, result, "Categories retrieved successfully", 200);
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return sendError(c, "Failed to fetch categories", 500, error);
    }
});

// GET /api/v1/categories/:id - Mengambil kategori by ID
categoryRoutes.get("/:id", async (c) => {
    const id = c.req.param("id");

    try {
        const result = await CategoryService.getById(id);

        if (!result) {
            return sendError(c, "Category not found", 404);
        }

        return sendSuccess(c, result, "Category retrieved successfully", 200);
    } catch (error) {
        console.error("Failed to fetch category:", error);
        return sendError(c, "Failed to fetch category", 500, error);
    }
});

// POST /api/v1/categories - Tambah kategori baru
categoryRoutes.post("/", async (c) => {
    try {
        const body = await c.req.json();
        if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
            return sendError(c, "Nama kategori wajib diisi", 400);
        }

        const created = await CategoryService.create({
            name: body.name,
            description: body.description,
        });

        return sendSuccess(c, created, "Category created successfully", 201);
    } catch (error) {
        console.error("Failed to create category:", error);
        return sendError(c, "Failed to create category", 500, error);
    }
});

export default categoryRoutes;

import { Hono } from "hono";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "../db/index";
import { categories, products } from "../db/schema/index";

const categoryRoutes = new Hono();

// GET /api/v1/categories - Mengambil seluruh kategori
categoryRoutes.get("/", async (c) => {
    try {
        const result = await db
            .select({
                id: categories.id,
                name: categories.name,
                description: categories.description,
                createdAt: categories.createdAt,
                updatedAt: categories.updatedAt,
                productCount: sql<number>`(SELECT count(*)::int FROM ${products} WHERE ${products.categoryId} = ${categories.id})`,
            })
            .from(categories)
            .orderBy(desc(categories.createdAt));

        return c.json({
            success: true,
            message: "Categories retrieved successfully",
            data: result,
        }, 200);
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return c.json({
            success: false,
            message: "Failed to fetch categories",
            error: error instanceof Error ? error.message : String(error),
        }, 500);
    }
});

// GET /api/v1/categories/:id - Mengambil kategori by ID
categoryRoutes.get("/:id", async (c) => {
    const id = c.req.param("id");

    try {
        const [result] = await db
            .select()
            .from(categories)
            .where(eq(categories.id, id))
            .limit(1);

        if (!result) {
            return c.json({
                success: false,
                message: "Category not found",
            }, 404);
        }

        return c.json({
            success: true,
            message: "Category retrieved successfully",
            data: result,
        }, 200);
    } catch (error) {
        console.error("Failed to fetch category:", error);
        return c.json({
            success: false,
            message: "Failed to fetch category",
            error: error instanceof Error ? error.message : String(error),
        }, 500);
    }
});

// POST /api/v1/categories - Tambah kategori baru
categoryRoutes.post("/", async (c) => {
    try {
        const body = await c.req.json();
        if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
            return c.json({ success: false, message: "Nama kategori wajib diisi" }, 400);
        }

        const [created] = await db
            .insert(categories)
            .values({
                name: body.name.trim(),
                description: body.description?.trim() || "",
            })
            .returning();

        return c.json({
            success: true,
            message: "Category created successfully",
            data: created,
        }, 201);
    } catch (error) {
        console.error("Failed to create category:", error);
        return c.json({
            success: false,
            message: "Failed to create category",
            error: error instanceof Error ? error.message : String(error),
        }, 500);
    }
});

export default categoryRoutes;

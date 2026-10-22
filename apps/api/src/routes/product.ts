import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ProductService } from "../services/product.service";
import { createProductSchema, updateProductSchema } from "../validator/validator.product";
import { authMiddleware, requireRole } from "../middleware/auth";
import { sendSuccess, sendError } from "../lib/response";

const productsRoutes = new Hono();

// Seluruh route produk memerlukan autentikasi
productsRoutes.use("*", authMiddleware);

// GET /api/v1/products - Mengambil seluruh produk
productsRoutes.get("/", async (c) => {
    try {
        const result = await ProductService.getAll();
        return sendSuccess(c, result, "Product successfully retrieved", 200);
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return sendError(c, "Failed to fetch products", 500, error);
    }
});

// GET /api/v1/products/:id - Mengambil produk by ID
productsRoutes.get("/:id", async (c) => {
    const id = c.req.param("id");

    try {
        const result = await ProductService.getById(id);

        if (!result) {
            return sendError(c, "Product not found", 404);
        }

        return sendSuccess(c, result, "Product retrieved successfully", 200);
    } catch (error) {
        console.error("Failed to fetch product:", error);
        return sendError(c, "Failed to fetch product", 500, error);
    }
});

// POST /api/v1/products - Menambahkan produk baru
productsRoutes.post("/", zValidator("json", createProductSchema), async (c) => {
    const data = c.req.valid("json");

    try {
        const result = await ProductService.create(data);
        return sendSuccess(c, result, "Product created successfully", 201);
    } catch (error) {
        console.error("Error creating product:", error);
        if (error instanceof Error && error.message.includes("duplicate key")) {
            return sendError(c, "SKU already exists", 400);
        }
        return sendError(c, "Failed to create product", 500, error);
    }
});

// PATCH /api/v1/products/:id - Mengubah data produk
productsRoutes.patch(
    "/:id",
    zValidator("json", updateProductSchema),
    async (c) => {
        const id = c.req.param("id");
        const data = c.req.valid("json");

        try {
            const result = await ProductService.update(id, data);

            if (!result) {
                return sendError(c, "Product not found", 404);
            }

            return sendSuccess(c, result, "Product updated successfully", 200);
        } catch (error) {
            console.error("Update product error:", error);
            return sendError(
                c,
                "Failed to update product. Check SKU uniqueness and category ID.",
                500,
                error
            );
        }
    }
);

// DELETE /api/v1/products/:id - Menghapus produk (Admin saja)
productsRoutes.delete("/:id", requireRole(["Admin"]), async (c) => {
    const id = c.req.param("id");

    if (!id) {
        return sendError(c, "ID produk tidak valid", 400);
    }

    try {
        const result = await ProductService.delete(id);

        if (!result) {
            return sendError(c, "Product not found", 404);
        }

        return sendSuccess(c, result, "Product deleted successfully", 200);
    } catch (error) {
        console.error("Delete product error:", error);
        return sendError(c, "Failed to delete product", 500, error);
    }
});

export default productsRoutes;

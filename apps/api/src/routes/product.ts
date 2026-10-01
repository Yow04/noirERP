import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { desc, eq } from "drizzle-orm";

import { db } from "../db";
import { categories, products } from "../db/schema";
import { createProductSchema, updateProductSchema } from "../validator/validator.product";

const productsRoutes = new Hono();

//mengambil product untuk seluruhnya
productsRoutes.get('/', async (c) => {
    try {
        const result = await db
            .select({
                id: products.id,
                categoryId: products.categoryId,
                sku: products.sku,
                name: products.name,
                description: products.description,
                purchasePrice: products.purchasePrice,
                sellingPrice: products.sellingPrice,
                stock: products.stock,
                createdAt: products.createdAt,
                updatedAt: products.updatedAt,
            })
            .from(products)
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .orderBy(desc(products.createdAt));

        return c.json({
            success: true,
            message: "Product succesfully retrieved",
            data: result,
        }, 200);
    } catch (error) {
        return c.json({
            success: false,
            message: "Failed to fetch products",
            error
        }, 500);
    }
});

//Mengambil produk by id
productsRoutes.get('/:id', async (c) => {
    const id = c.req.param('id');

    try {
        const result = await db
            .select()
            .from(products)
            .where(eq(products.id, id))
            .limit(1);

        if (result.length === 0) {
            return c.json({
                success: false,
                message: 'Product not found'
            }, 404);
        }

        return c.json({
            success: true,
            message: 'product retrieved succesfully',
            data: result[0],
        }, 200);
    } catch (error) {
        return c.json({
            success: false,
            message: 'failed to fetch product',
            error
        }, 500);
    }
});

//menambahkan produk baru
productsRoutes.post('/', zValidator('json', createProductSchema), async (c) => {
    const data = c.req.valid('json');

    try {
        const result = await db
            .insert(products)
            .values({
                categoryId: data.categoryId ?? null,
                sku: data.sku,
                name: data.name,
                description: data.description || null,
                purchasePrice: data.purchasePrice.toString(),
                sellingPrice: data.sellingPrice.toString(),
                stock: data.stock,
            })
            .returning();

        return c.json({
            success: true,
            message: 'Product created successfully',
            data: result[0],
        }, 201);
    } catch (error) {
        console.error("Error creating product:", error);
        // Handle duplicate SKU or other constraint errors
        if (error instanceof Error && error.message.includes('duplicate key')) {
            return c.json({
                success: false,
                message: 'SKU already exists'
            }, 400);
        }
        return c.json({
            success: false,
            message: 'Failed to create product'
        }, 500);
    }
});

//mengubah identitas dari produk
productsRoutes.patch(
    "/:id",
    zValidator("json", updateProductSchema),
    async (c) => {
        const id = c.req.param("id");
        const { purchasePrice, sellingPrice, ...rest } = c.req.valid("json");

        try {
            const updateData = {
                ...rest,
                ...(purchasePrice !== undefined && { purchasePrice: String(purchasePrice) }),
                ...(sellingPrice !== undefined && { sellingPrice: String(sellingPrice) }),
                updatedAt: new Date(),
            }

            const result = await db
                .update(products)
                .set(updateData)
                .where(eq(products.id, id))
                .returning();

            if (result.length === 0) {
                return c.json({
                    success: false,
                    message: "Product not found",
                }, 404);
            }

            return c.json({
                success: true,
                message: "Product updated successfully",
                data: result[0],
            });
        } catch (error) {
            console.error("Update product error:", error);

            return c.json({
                success: false,
                message: "Failed to update product. Check SKU uniqueness and category ID.",
            }, 500);
        }
    },
);

//melakukan delete pada produk tertentu by id
productsRoutes.delete("/:id", async (c) => {
    const id = c.req.param("id");

    try {
        const result = await db
            .delete(products)
            .where(eq(products.id, id))
            .returning({ id: products.id });

        if (result.length === 0) {
            return c.json({
                success: false,
                message: "Product not found",
            }, 404);
        }

        return c.json({
            success: true,
            message: "Product deleted successfully",
            data: result[0],
        });
    } catch (error) {
        console.error("Delete product error:", error);

        return c.json({
            success: false,
            message: "Failed to delete product",
        }, 500);
    }
});
export default productsRoutes;

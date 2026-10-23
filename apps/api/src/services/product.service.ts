import { desc, eq } from "drizzle-orm";
import { db } from "../db/index";
import { categories, products, stockMutations } from "../db/schema/index";

export type CreateProductParams = {
    categoryId?: string | null;
    sku: string;
    name: string;
    description?: string | null;
    purchasePrice: number | string;
    sellingPrice: number | string;
    stock: number;
    minStock?: number;
};

export type UpdateProductParams = {
    categoryId?: string | null;
    sku?: string;
    name?: string;
    description?: string | null;
    purchasePrice?: number | string;
    sellingPrice?: number | string;
    stock?: number;
    minStock?: number;
};

export class ProductService {
    // Ambil seluruh daftar produk beserta nama kategori
    static async getAll() {
        return await db
            .select({
                id: products.id,
                categoryId: products.categoryId,
                categoryName: categories.name,
                sku: products.sku,
                name: products.name,
                description: products.description,
                purchasePrice: products.purchasePrice,
                sellingPrice: products.sellingPrice,
                stock: products.stock,
                minStock: products.minStock,
                createdAt: products.createdAt,
                updatedAt: products.updatedAt,
            })
            .from(products)
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .orderBy(desc(products.createdAt));
    }

    // Ambil detail produk berdasarkan ID
    static async getById(id: string) {
        const [result] = await db
            .select()
            .from(products)
            .where(eq(products.id, id))
            .limit(1);

        return result || null;
    }

    // Buat produk baru dan catat mutasi stok awal jika ada
    static async create(data: CreateProductParams) {
        return await db.transaction(async (tx) => {
            const [created] = await tx
                .insert(products)
                .values({
                    categoryId: data.categoryId ?? null,
                    sku: data.sku,
                    name: data.name,
                    description: data.description || null,
                    purchasePrice: data.purchasePrice.toString(),
                    sellingPrice: data.sellingPrice.toString(),
                    stock: data.stock,
                    minStock: data.minStock ?? 5,
                })
                .returning();

            // Catat mutasi awal jika stok lebih dari 0
            if (data.stock > 0) {
                await tx.insert(stockMutations).values({
                    productId: created.id,
                    type: "INITIAL",
                    quantity: data.stock,
                    previousStock: 0,
                    currentStock: data.stock,
                    reference: "INIT",
                    notes: "Stok awal saat pembuatan produk baru",
                });
            }

            return created;
        });
    }

    // Perbarui data produk
    static async update(id: string, data: UpdateProductParams) {
        const { purchasePrice, sellingPrice, minStock, ...rest } = data;

        const updateData = {
            ...rest,
            ...(purchasePrice !== undefined && { purchasePrice: String(purchasePrice) }),
            ...(sellingPrice !== undefined && { sellingPrice: String(sellingPrice) }),
            ...(minStock !== undefined && { minStock: Number(minStock) }),
            updatedAt: new Date(),
        };

        const [result] = await db
            .update(products)
            .set(updateData)
            .where(eq(products.id, id))
            .returning();

        return result || null;
    }

    // Hapus produk berdasarkan ID
    static async delete(id: string) {
        const [result] = await db
            .delete(products)
            .where(eq(products.id, id))
            .returning({ id: products.id });

        return result || null;
    }
}

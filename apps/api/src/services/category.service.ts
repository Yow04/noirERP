import { desc, eq, sql } from "drizzle-orm";
import { db } from "../db/index";
import { categories, products } from "../db/schema/index";

export type CreateCategoryParams = {
    name: string;
    description?: string | null;
};

export class CategoryService {
    // Ambil seluruh kategori dengan jumlah produk terkait
    static async getAll() {
        return await db
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
    }

    // Ambil detail kategori berdasarkan ID
    static async getById(id: string) {
        const [result] = await db
            .select()
            .from(categories)
            .where(eq(categories.id, id))
            .limit(1);

        return result || null;
    }

    // Tambah kategori baru
    static async create(params: CreateCategoryParams) {
        const [created] = await db
            .insert(categories)
            .values({
                name: params.name.trim(),
                description: params.description?.trim() || "",
            })
            .returning();

        return created;
    }
}

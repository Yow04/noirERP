import { eq, desc, sql, and, or, ilike, lte, gt } from "drizzle-orm";
import { db } from "../db";
import { products, stockMutations, categories } from "../db/schema";

export type StockMutationType = "INITIAL" | "IN" | "OUT" | "ADJUSTMENT";

export type RecordMutationParams = {
    productId: string;
    type: StockMutationType;
    quantity: number;
    adjustmentMode?: "SET" | "DELTA";
    reference?: string | null;
    notes?: string | null;
};

export type StockStatus = "OUT_OF_STOCK" | "LOW_STOCK" | "NORMAL";

export function determineStockStatus(stock: number, minStock: number): StockStatus {
    if (stock <= 0) return "OUT_OF_STOCK";
    if (stock <= minStock) return "LOW_STOCK";
    return "NORMAL";
}

export class InventoryService {
    /**
     * Catat mutasi stok dan perbarui stok produk secara atomik (transactional).
     * Dapat digunakan ulang (reusable) di berbagai controller/service (misal: POS, Purchase, Stock Opname).
     */
    static async recordMutation(params: RecordMutationParams, externalTx?: any) {
        const executor = externalTx ?? db;

        const executeMutation = async (tx: typeof db) => {
            // 1. Ambil data produk saat ini
            const [product] = await tx
                .select({
                    id: products.id,
                    name: products.name,
                    sku: products.sku,
                    stock: products.stock,
                    minStock: products.minStock,
                })
                .from(products)
                .where(eq(products.id, params.productId))
                .limit(1);

            if (!product) {
                throw new Error(`Produk dengan ID ${params.productId} tidak ditemukan.`);
            }

            const previousStock = product.stock;
            let currentStock = previousStock;
            let mutationQuantity = Math.abs(params.quantity);

            // 2. Hitung stok baru berdasarkan tipe mutasi
            switch (params.type) {
                case "INITIAL":
                    // Stok awal: mengganti stok langsung atau set awal
                    currentStock = params.quantity;
                    mutationQuantity = params.quantity;
                    break;

                case "IN":
                    // Stok masuk (pembelian, retur barang masuk, restock)
                    currentStock = previousStock + mutationQuantity;
                    break;

                case "OUT":
                    // Stok keluar (penjualan, rusak, expired, pemakaian)
                    if (previousStock < mutationQuantity) {
                        throw new Error(
                            `Stok tidak mencukupi untuk pengurangan. Stok saat ini: ${previousStock}, diminta: ${mutationQuantity}.`
                        );
                    }
                    currentStock = previousStock - mutationQuantity;
                    break;

                case "ADJUSTMENT":
                    // Penyesuaian stok (stock opname)
                    if (params.adjustmentMode === "SET") {
                        // Kuantitas adalah target fisik akhir
                        currentStock = params.quantity;
                        mutationQuantity = currentStock - previousStock;
                    } else {
                        // Kuantitas adalah selisih (bisa positif / negatif)
                        currentStock = previousStock + params.quantity;
                        mutationQuantity = params.quantity;
                        if (currentStock < 0) {
                            throw new Error(
                                `Penyesuaian menyebabkan stok bernilai negatif (${currentStock}). Tidak diizinkan.`
                            );
                        }
                    }
                    break;

                default:
                    throw new Error(`Tipe mutasi tidak valid: ${params.type}`);
            }

            // 3. Update stok pada tabel products
            await tx
                .update(products)
                .set({
                    stock: currentStock,
                    updatedAt: new Date(),
                })
                .where(eq(products.id, params.productId));

            // 4. Masukkan log ke tabel stock_mutations
            const [mutationRecord] = await tx
                .insert(stockMutations)
                .values({
                    productId: params.productId,
                    type: params.type,
                    quantity: mutationQuantity,
                    previousStock,
                    currentStock,
                    reference: params.reference || null,
                    notes: params.notes || null,
                })
                .returning();

            const status = determineStockStatus(currentStock, product.minStock);

            return {
                mutation: mutationRecord,
                product: {
                    id: product.id,
                    name: product.name,
                    sku: product.sku,
                    previousStock,
                    currentStock,
                    minStock: product.minStock,
                    status,
                },
            };
        };

        if (externalTx) {
            return await executeMutation(externalTx);
        } else {
            return await db.transaction(async (tx) => {
                return await executeMutation(tx as any);
            });
        }
    }

    /**
     * Memperbarui aturan stok minimum untuk produk tertentu
     */
    static async updateMinStock(productId: string, minStock: number) {
        if (minStock < 0) {
            throw new Error("Stok minimum tidak boleh negatif.");
        }

        const [updatedProduct] = await db
            .update(products)
            .set({
                minStock,
                updatedAt: new Date(),
            })
            .where(eq(products.id, productId))
            .returning({
                id: products.id,
                name: products.name,
                sku: products.sku,
                stock: products.stock,
                minStock: products.minStock,
            });

        if (!updatedProduct) {
            throw new Error("Produk tidak ditemukan.");
        }

        const status = determineStockStatus(updatedProduct.stock, updatedProduct.minStock);

        return {
            ...updatedProduct,
            status,
        };
    }

    /**
     * Mengambil daftar produk inventaris lengkap dengan status stok & aturan stok minimum
     */
    static async getInventoryItems(filters: {
        status?: "all" | "normal" | "low" | "out";
        search?: string;
        categoryId?: string;
        page?: number;
        limit?: number;
    }) {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 50;
        const offset = (page - 1) * limit;

        const conditions = [];

        if (filters.search && filters.search.trim()) {
            const query = `%${filters.search.trim()}%`;
            conditions.push(
                or(ilike(products.name, query), ilike(products.sku, query))
            );
        }

        if (filters.categoryId) {
            conditions.push(eq(products.categoryId, filters.categoryId));
        }

        if (filters.status === "out") {
            conditions.push(eq(products.stock, 0));
        } else if (filters.status === "low") {
            conditions.push(
                and(lte(products.stock, products.minStock), gt(products.stock, 0))
            );
        } else if (filters.status === "normal") {
            conditions.push(gt(products.stock, products.minStock));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const items = await db
            .select({
                id: products.id,
                sku: products.sku,
                name: products.name,
                stock: products.stock,
                minStock: products.minStock,
                purchasePrice: products.purchasePrice,
                sellingPrice: products.sellingPrice,
                categoryId: products.categoryId,
                categoryName: categories.name,
                updatedAt: products.updatedAt,
            })
            .from(products)
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .where(whereClause)
            .orderBy(desc(products.updatedAt))
            .limit(limit)
            .offset(offset);

        const enrichedItems = items.map((item) => ({
            ...item,
            status: determineStockStatus(item.stock, item.minStock),
            isBelowMinStock: item.stock <= item.minStock,
        }));

        return enrichedItems;
    }

    /**
     * Mengambil riwayat mutasi stok dengan filtering
     */
    static async getMutations(filters: {
        productId?: string;
        type?: StockMutationType;
        search?: string;
        page?: number;
        limit?: number;
    }) {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 50;
        const offset = (page - 1) * limit;

        const conditions = [];

        if (filters.productId) {
            conditions.push(eq(stockMutations.productId, filters.productId));
        }

        if (filters.type) {
            conditions.push(eq(stockMutations.type, filters.type));
        }

        if (filters.search && filters.search.trim()) {
            const query = `%${filters.search.trim()}%`;
            conditions.push(
                or(
                    ilike(products.name, query),
                    ilike(products.sku, query),
                    ilike(stockMutations.reference, query),
                    ilike(stockMutations.notes, query)
                )
            );
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const mutations = await db
            .select({
                id: stockMutations.id,
                productId: stockMutations.productId,
                productName: products.name,
                productSku: products.sku,
                type: stockMutations.type,
                quantity: stockMutations.quantity,
                previousStock: stockMutations.previousStock,
                currentStock: stockMutations.currentStock,
                reference: stockMutations.reference,
                notes: stockMutations.notes,
                createdAt: stockMutations.createdAt,
            })
            .from(stockMutations)
            .innerJoin(products, eq(stockMutations.productId, products.id))
            .where(whereClause)
            .orderBy(desc(stockMutations.createdAt))
            .limit(limit)
            .offset(offset);

        return mutations;
    }

    /**
     * Ringkasan stok inventaris untuk KPI & widget
     */
    static async getSummary() {
        const [totalProductsRow] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(products);

        const [totalStockRow] = await db
            .select({ total: sql<number>`coalesce(sum(${products.stock}), 0)::int` })
            .from(products);

        // Low stock: stock <= minStock AND stock > 0
        const [lowStockRow] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(products)
            .where(and(lte(products.stock, products.minStock), gt(products.stock, 0)));

        // Out of stock: stock = 0
        const [outOfStockRow] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(products)
            .where(eq(products.stock, 0));

        // Total mutations recorded
        const [mutationsCountRow] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(stockMutations);

        const totalSKUs = totalProductsRow?.count ?? 0;
        const lowStockCount = lowStockRow?.count ?? 0;
        const outOfStockCount = outOfStockRow?.count ?? 0;
        const healthyStockCount = Math.max(0, totalSKUs - lowStockCount - outOfStockCount);

        return {
            totalSKUs,
            totalStock: totalStockRow?.total ?? 0,
            lowStockCount,
            outOfStockCount,
            healthyStockCount,
            totalMutations: mutationsCountRow?.count ?? 0,
        };
    }
}

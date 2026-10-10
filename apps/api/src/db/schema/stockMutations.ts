import {
    pgTable,
    uuid,
    varchar,
    text,
    integer,
    timestamp,
    pgEnum,
    foreignKey,
} from 'drizzle-orm/pg-core';
import { products } from './products';

export const stockMutationTypeEnum = pgEnum('stock_mutation_type', [
    'INITIAL',     // Stok awal produk
    'IN',          // Stok masuk (pembelian, restock, retur customer)
    'OUT',         // Stok keluar (penjualan, barang rusak, pemakaian internal)
    'ADJUSTMENT',  // Penyesuaian stok (stock opname / koreksi fisik)
]);

export const stockMutations = pgTable('stock_mutations', {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id').notNull(),
    type: stockMutationTypeEnum('type').notNull(),
    quantity: integer('quantity').notNull(),
    previousStock: integer('previous_stock').notNull(),
    currentStock: integer('current_stock').notNull(),
    reference: varchar('reference', { length: 100 }),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
    foreignKey({
        columns: [table.productId],
        foreignColumns: [products.id],
    }).onDelete('cascade'),
]);

import {
    pgTable,
    uuid,
    varchar,
    text,
    integer,
    numeric,
    timestamp,
    pgEnum,
    foreignKey,
} from 'drizzle-orm/pg-core';
import { suppliers } from './suppliers';
import { products } from './products';

export const purchaseStatusEnum = pgEnum('purchase_status', [
    'DRAFT',      // PO baru dibuat, belum diterima
    'RECEIVED',   // Barang sudah diterima, stok sudah bertambah
    'CANCELLED',  // PO dibatalkan
]);

export const purchaseOrders = pgTable('purchase_orders', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
    supplierId: uuid('supplier_id'),
    status: purchaseStatusEnum('status').notNull().default('DRAFT'),
    notes: text('notes'),
    totalAmount: numeric('total_amount', { precision: 15, scale: 2 }).default('0').notNull(),
    receivedAt: timestamp('received_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
    foreignKey({
        columns: [table.supplierId],
        foreignColumns: [suppliers.id],
    }).onDelete('set null'),
]);

export const purchaseOrderItems = pgTable('purchase_order_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    purchaseOrderId: uuid('purchase_order_id').notNull(),
    productId: uuid('product_id').notNull(),
    quantity: integer('quantity').notNull(),
    unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
    subtotal: numeric('subtotal', { precision: 15, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
    foreignKey({
        columns: [table.purchaseOrderId],
        foreignColumns: [purchaseOrders.id],
    }).onDelete('cascade'),
    foreignKey({
        columns: [table.productId],
        foreignColumns: [products.id],
    }).onDelete('restrict'),
]);

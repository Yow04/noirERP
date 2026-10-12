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
import { products } from './products';

export const salesStatusEnum = pgEnum('sales_status', [
    'DRAFT',      // SO baru dibuat, belum dikonfirmasi
    'COMPLETED',  // Penjualan selesai, stok sudah berkurang
    'CANCELLED',  // SO dibatalkan
]);

export const salesOrders = pgTable('sales_orders', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
    customerName: varchar('customer_name', { length: 150 }),
    status: salesStatusEnum('status').notNull().default('DRAFT'),
    notes: text('notes'),
    totalAmount: numeric('total_amount', { precision: 15, scale: 2 }).default('0').notNull(),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const salesOrderItems = pgTable('sales_order_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    salesOrderId: uuid('sales_order_id').notNull(),
    productId: uuid('product_id').notNull(),
    quantity: integer('quantity').notNull(),
    unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
    subtotal: numeric('subtotal', { precision: 15, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
    foreignKey({
        columns: [table.salesOrderId],
        foreignColumns: [salesOrders.id],
    }).onDelete('cascade'),
    foreignKey({
        columns: [table.productId],
        foreignColumns: [products.id],
    }).onDelete('restrict'),
]);

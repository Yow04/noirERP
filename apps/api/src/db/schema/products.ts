import {
    pgTable,
    uuid,
    varchar,
    text,
    integer,
    numeric,
    timestamp,
} from 'drizzle-orm/pg-core';

import { categories } from './categories';

export const products = pgTable('products', {
    id: uuid('id').primaryKey().defaultRandom(),
    categoryId: uuid("category_id").references(() => categories.id, {
        onDelete: 'set null',
    }),
    sku: varchar('sku', { length: 100 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    purchasePrice: numeric('purchase_price', { precision: 10, scale: 2 }).default('0').notNull(),
    sellingPrice: numeric('selling_price', { precision: 10, scale: 2 }).default('0').notNull(),
    stock: integer('stock').default(0).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
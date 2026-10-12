import { z } from "zod";

// Schema untuk item dalam sales order
const salesOrderItemSchema = z.object({
    productId: z.string().uuid("Product ID tidak valid"),
    quantity: z.coerce.number().int().min(1, "Kuantitas minimal 1"),
    unitPrice: z.coerce.number().min(0, "Harga satuan tidak boleh negatif"),
});

// Schema untuk membuat sales order baru
export const createSalesOrderSchema = z.object({
    customerName: z.string().trim().max(150).nullable().optional(),
    notes: z.string().max(2000).nullable().optional(),
    items: z.array(salesOrderItemSchema).min(1, "Minimal 1 item dalam SO"),
});

// Schema untuk filter daftar SO
export const salesFilterSchema = z.object({
    status: z.enum(["all", "DRAFT", "COMPLETED", "CANCELLED"]).default("all").optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
});

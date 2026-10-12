import { z } from "zod";

// Schema untuk item dalam purchase order
const purchaseOrderItemSchema = z.object({
    productId: z.string().uuid("Product ID tidak valid"),
    quantity: z.coerce.number().int().min(1, "Kuantitas minimal 1"),
    unitPrice: z.coerce.number().min(0, "Harga satuan tidak boleh negatif"),
});

// Schema untuk membuat purchase order baru
export const createPurchaseOrderSchema = z.object({
    supplierId: z.string().uuid("Supplier ID tidak valid").nullable().optional(),
    notes: z.string().max(2000).nullable().optional(),
    items: z.array(purchaseOrderItemSchema).min(1, "Minimal 1 item dalam PO"),
});

// Schema untuk filter daftar PO
export const purchaseFilterSchema = z.object({
    status: z.enum(["all", "DRAFT", "RECEIVED", "CANCELLED"]).default("all").optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
});

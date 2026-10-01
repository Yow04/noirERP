import { z } from "zod";

export const createProductSchema = z.object({
    sku: z.string().trim().min(1, "SKU wajib diisi").max(50),
    name: z.string().trim().min(1, "Nama produk wajib diisi").max(150),
    description: z.string().max(5000).nullable().optional(),
    categoryId: z.string().uuid().nullable().optional(),
    purchasePrice: z.coerce.number().min(0),
    sellingPrice: z.coerce.number().min(0),
    stock: z.coerce.number().int().min(0),
});

export const updateProductSchema = createProductSchema.partial();
import { z } from "zod";

export const stockMutationTypeSchema = z.enum(["INITIAL", "IN", "OUT", "ADJUSTMENT"]);

export const createStockMutationSchema = z.object({
    productId: z.string().uuid("Product ID harus berupa UUID valid"),
    type: stockMutationTypeSchema,
    quantity: z.coerce.number().int("Kuantitas harus bilangan bulat"),
    adjustmentMode: z.enum(["SET", "DELTA"]).optional().default("SET"),
    reference: z.string().trim().max(100, "Nomor referensi maksimal 100 karakter").optional().nullable(),
    notes: z.string().trim().max(1000, "Catatan maksimal 1000 karakter").optional().nullable(),
}).superRefine((data, ctx) => {
    if (data.type === "IN" && data.quantity <= 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Kuantitas stok masuk harus lebih dari 0",
            path: ["quantity"],
        });
    }
    if (data.type === "OUT" && data.quantity <= 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Kuantitas stok keluar harus lebih dari 0",
            path: ["quantity"],
        });
    }
    if (data.type === "INITIAL" && data.quantity < 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Kuantitas stok awal tidak boleh negatif",
            path: ["quantity"],
        });
    }
    if (data.type === "ADJUSTMENT" && data.adjustmentMode === "SET" && data.quantity < 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Hasil penyesuaian stok fisik tidak boleh negatif",
            path: ["quantity"],
        });
    }
});

export const updateMinStockSchema = z.object({
    minStock: z.coerce
        .number()
        .int("Stok minimum harus bilangan bulat")
        .min(0, "Stok minimum minimal 0"),
});

export const inventoryFilterSchema = z.object({
    status: z.enum(["all", "normal", "low", "out"]).optional().default("all"),
    search: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export const mutationFilterSchema = z.object({
    productId: z.string().uuid().optional(),
    type: stockMutationTypeSchema.optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().trim().email("Format email tidak valid").toLowerCase(),
    password: z.string().min(1, "Kata sandi wajib diisi"),
});

export const registerSchema = z.object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
    email: z.string().trim().email("Format email tidak valid").toLowerCase(),
    password: z.string().min(6, "Kata sandi minimal 6 karakter"),
    role: z.enum(["admin", "staff"]).default("staff").optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

import type { Context, Next } from "hono";
import { verify } from "hono/jwt";

export interface AuthPayload {
    id: string;
    email: string;
    name: string;
    role: "Admin" | "Staff" | string;
    exp?: number;
}

declare module "hono" {
    interface ContextVariableMap {
        user: AuthPayload;
    }
}

const JWT_SECRET = process.env.JWT_SECRET_KEY || "noir_erp_fallback_secret_key_2026";

export async function authMiddleware(c: Context, next: Next) {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json(
            {
                success: false,
                message: "Akses ditolak: Token autentikasi tidak ditemukan.",
            },
            401
        );
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = (await verify(token, JWT_SECRET, "HS256")) as unknown as AuthPayload;
        c.set("user", payload);
        await next();
    } catch (error) {
        return c.json(
            {
                success: false,
                message: "Akses ditolak: Token tidak valid atau telah kedaluwarsa.",
            },
            401
        );
    }
}

export function requireRole(allowedRoles: Array<"Admin" | "Staff" | string>) {
    return async (c: Context, next: Next) => {
        const user = c.get("user");
        const userRole = user?.role?.toLowerCase();
        const isAllowed = user && allowedRoles.some((r) => r.toLowerCase() === userRole);

        if (!isAllowed) {
            return c.json(
                {
                    success: false,
                    message: "Akses ditolak: Anda tidak memiliki izin untuk tindakan ini.",
                },
                403
            );
        }
        await next();
    };
}

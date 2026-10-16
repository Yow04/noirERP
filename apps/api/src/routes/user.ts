import { Hono } from "hono";
import { desc } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

const userRoutes = new Hono();

// GET /api/v1/users - Mengambil daftar pengguna
userRoutes.get("/", async (c) => {
    try {
        const result = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .orderBy(desc(users.createdAt));

        return c.json({
            success: true,
            message: "Users retrieved successfully",
            data: result,
        }, 200);
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return c.json({
            success: false,
            message: "Failed to fetch users",
            error: error instanceof Error ? error.message : String(error),
        }, 500);
    }
});

export default userRoutes;

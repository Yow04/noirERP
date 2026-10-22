import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { DashboardService } from "../services/dashboard.service";
import { sendSuccess, sendError } from "../lib/response";

const dashboardRoutes = new Hono();

// Seluruh route analitik dan dashboard memerlukan autentikasi
dashboardRoutes.use("*", authMiddleware);

// Analytics endpoint
dashboardRoutes.get("/analytics", async (c) => {
    try {
        const daysParam = c.req.query("days");
        const days = daysParam ? parseInt(daysParam, 10) : 7;
        const analytics = await DashboardService.getAnalytics(days);

        return sendSuccess(c, analytics, "Analytics data retrieved successfully");
    } catch (error) {
        console.error("Analytics error:", error);
        return sendError(c, "Failed to fetch analytics data", 500, error);
    }
});

// Dashboard summary endpoint
dashboardRoutes.get("/", async (c) => {
    try {
        const overview = await DashboardService.getOverview();
        return sendSuccess(c, overview, "Dashboard data retrieved successfully");
    } catch (error) {
        console.error("Dashboard error:", error);
        return sendError(c, "Failed to fetch dashboard data", 500, error);
    }
});

export default dashboardRoutes;

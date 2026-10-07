export type RecentProduct = {
    id: string;
    sku: string;
    name: string;
    sellingPrice: string | number;
    stock: number;
    createdAt: string;
};

export type DashboardData = {
    totalProducts: number;
    totalCategories: number;
    totalUsers: number;
    totalStock: number;
    inventoryValue: number;
    potentialRevenue: number;
    lowStockCount: number;
    outOfStockCount: number;
    recentProducts: RecentProduct[];
};

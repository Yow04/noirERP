export type RecentProduct = {
    id: string;
    sku: string;
    name: string;
    sellingPrice: string | number;
    stock: number;
    createdAt: string;
};

export type DailyTrend = {
    date: string;
    label: string;
    dayName: string;
    sales: number;
    purchases: number;
};

export type FinancialComparison = {
    inventoryValue: number;
    potentialRevenue: number;
    realizedRevenue: number;
    totalPurchases: number;
    estimatedMargin: number;
    marginPercentage: number;
    realizationRate: number;
};

export type DashboardAnalytics = {
    days: number;
    trend: DailyTrend[];
    summary: {
        totalSalesPeriod: number;
        totalPurchasesPeriod: number;
        netCashflow: number;
    };
    financialComparison: FinancialComparison;
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
    analytics?: DashboardAnalytics;
};

export type SalesStatus = "DRAFT" | "COMPLETED" | "CANCELLED";

export type SalesOrderItem = {
    id: string;
    productId: string;
    productName: string;
    productSku: string;
    quantity: number;
    unitPrice: string | number;
    subtotal: string | number;
};

export type SalesOrder = {
    id: string;
    orderNumber: string;
    customerName: string | null;
    status: SalesStatus;
    notes: string | null;
    totalAmount: string | number;
    totalItems?: number;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
    items?: SalesOrderItem[];
};

export type SalesSummary = {
    totalOrders: number;
    draftOrders: number;
    completedOrders: number;
    totalRevenue: number;
    todayTransactions: number;
    todayRevenue: number;
};

export type CreateSalesOrderItemInput = {
    productId: string;
    quantity: number;
    unitPrice: number;
};

export type CreateSalesOrderInput = {
    customerName?: string | null;
    notes?: string | null;
    items: CreateSalesOrderItemInput[];
};

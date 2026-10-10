export type StockMutationType = "INITIAL" | "IN" | "OUT" | "ADJUSTMENT";

export type StockStatus = "NORMAL" | "LOW_STOCK" | "OUT_OF_STOCK";

export type InventoryItem = {
    id: string;
    sku: string;
    name: string;
    stock: number;
    minStock: number;
    purchasePrice: string | number;
    sellingPrice: string | number;
    categoryId: string | null;
    categoryName: string | null;
    status: StockStatus;
    isBelowMinStock: boolean;
    updatedAt: string;
};

export type StockMutation = {
    id: string;
    productId: string;
    productName: string;
    productSku: string;
    type: StockMutationType;
    quantity: number;
    previousStock: number;
    currentStock: number;
    reference: string | null;
    notes: string | null;
    createdAt: string;
};

export type InventorySummary = {
    totalSKUs: number;
    totalStock: number;
    lowStockCount: number;
    outOfStockCount: number;
    healthyStockCount: number;
    totalMutations: number;
};

export type CreateMutationPayload = {
    productId: string;
    type: StockMutationType;
    quantity: number;
    adjustmentMode?: "SET" | "DELTA";
    reference?: string | null;
    notes?: string | null;
};

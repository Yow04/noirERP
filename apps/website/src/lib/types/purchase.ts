export type PurchaseStatus = "DRAFT" | "RECEIVED" | "CANCELLED";

export type Supplier = {
    id: string;
    name: string;
    contactPerson: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    createdAt?: string;
    updatedAt?: string;
};

export type PurchaseOrderItem = {
    id: string;
    productId: string;
    productName: string;
    productSku: string;
    quantity: number;
    unitPrice: string | number;
    subtotal: string | number;
};

export type PurchaseOrder = {
    id: string;
    orderNumber: string;
    supplierId: string | null;
    supplierName: string | null;
    supplierPhone: string | null;
    supplierEmail: string | null;
    status: PurchaseStatus;
    notes: string | null;
    totalAmount: string | number;
    totalItems?: number;
    receivedAt: string | null;
    createdAt: string;
    updatedAt: string;
    items?: PurchaseOrderItem[];
};

export type PurchaseSummary = {
    totalOrders: number;
    draftOrders: number;
    receivedOrders: number;
    totalPurchaseValue: number;
};

export type CreatePurchaseOrderItemInput = {
    productId: string;
    quantity: number;
    unitPrice: number;
};

export type CreatePurchaseOrderInput = {
    supplierId?: string | null;
    notes?: string | null;
    items: CreatePurchaseOrderItemInput[];
};

export type PurchaseProductOption = {
    id: string;
    name: string;
    sku: string;
    purchasePrice: number | string;
    stock: number;
};

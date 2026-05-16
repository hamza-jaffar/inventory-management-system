export interface Product {
    id: number;
    name: string;
    sku: string;
    barcode: string | null;
    slug: string;
    quantity: number;
    safety_stock: number;
    sale_price: number;
    retail_price: number;
    image_url: string | null;
    is_active: boolean;
    category?: { name: string };
    supplier?: { name: string };
}

export interface Supplier {
    id: number;
    name: string;
    code: string;
    contact_name: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    is_active: boolean;
}

export interface PurchaseOrder {
    id: number;
    po_number: string;
    supplier: {
        id: number;
        name: string;
    };
    status: string;
    total_cost: string;
    ordered_at: string;
    received_at: string | null;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    parent?: { name: string };
    is_active: boolean;
    sort_order: number;
}

export interface Order {
    id: number;
    order_number: string;
    grand_total: number;
    paid_amount: number;
    change_amount: number;
    payment_method: string;
    order_status: string;
    created_at: string;
    cashier: { name: string };
    items: any[];
}
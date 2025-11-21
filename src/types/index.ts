// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: Date;
}

export type UserRole = "admin" | "manager" | "staff" | "driver";

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  available: boolean;
  featured?: boolean;
  createdAt: Date;
  addons?: ProductAddon[]; // Added addon support
}

// Product Addon Types
export interface ProductAddon {
  id: string;
  name: string;
  description?: string;
  price: number;
  available: boolean;
  isGlobal?: boolean;
  maxOptions?: number;
  quantity?: number; // Used for tracking selected quantity
  selected?: boolean; // Used for tracking selected state
}

// Order Types
export interface Order {
  id: string;
  number: string;
  customer: Customer;
  items: OrderItem[];
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  orderType: OrderType; // Added this field
}

export interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
  basePrice?: number;
  notes?: string;
  addons?: Array<{
    addon: {
      id: string;
      name: string;
      price: number;
    };
    quantity: number;
    price: number;
  }>;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "canceled";

export type PaymentMethod = string;

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

// Customer Types
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: Address;
  orders?: Order[];
  createdAt: Date;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}

// Dashboard & Analytics Types
export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

// Navigation Types
export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType;
  children?: NavItem[];
}

// Add OrderType type
export type OrderType = "delivery" | "takeaway" | "instore";

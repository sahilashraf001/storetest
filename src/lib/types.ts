
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  features?: string[];
  stock: number; // Added stock for cart logic;
  "data-ai-hint"?: string;
}

export interface AddressType {
  id: string;
  name: string; // e.g., "Home", "Work", "John's Office"
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string; // Added optional phone number
  addresses?: AddressType[];
  isAdmin?: boolean; // Added for admin functionality
}

export interface CartItemType extends Product {
  quantity: number;
}

export interface WishlistItemType extends Product {}

export type OrderStatus = 
  | 'Confirmed' 
  | 'Pending' 
  | 'Shipped' 
  | 'Delivered' 
  | 'Cancelled' 
  | 'Awaiting Payment Confirmation';

export const ALL_ORDER_STATUSES: OrderStatus[] = [
  'Awaiting Payment Confirmation',
  'Confirmed',
  'Pending',
  'Shipped',
  'Delivered',
  'Cancelled',
];

export interface Order {
  id: string;
  userId: string;
  userEmail?: string; // Store user email for admin display
  userName?: string; // Store user name for admin display
  items: CartItemType[];
  totalAmount: number;
  shippingAddress: {
    name: string;
    address: string; 
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: Date;
  status: OrderStatus;
  paymentReceiptFilename?: string;
}


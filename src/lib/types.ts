
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

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string; // Added optional phone number
  // passwordHash: string; // In a real app, never store plain passwords
}

export interface CartItemType extends Product {
  quantity: number;
}

export interface WishlistItemType extends Product {}

export interface Order {
  id: string;
  userId: string;
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
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
}

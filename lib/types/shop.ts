/**
 * Shop-related TypeScript types
 */

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  image_url?: string;
  category: 'oil' | 'gutschein' | 'set' | 'other';
  inventory: number;
  created_at: string;
}

export interface CartItem {
  id: string; // Local ID for cart
  product_id: number;
  quantity: number;
  price: number; // Price at time of adding to cart
  product?: Product;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax?: number;
  total: number;
  currency: string;
}

export interface Order {
  id: string;
  customer_id: string;
  items: CartItem[];
  subtotal: number;
  tax?: number;
  total: number;
  currency: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'unpaid' | 'processing' | 'paid' | 'failed' | 'refunded';
  stripe_checkout_session_id?: string;
  stripe_payment_intent_id?: string;
  shipping_address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: number;
  quantity: number;
  price: number;
  product?: Product;
}

/**
 * Client-side cart state management using Zustand
 * Cart is stored in localStorage for persistence across sessions
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cart, CartItem, Product } from '../types/shop';

interface CartStore {
  cart: Cart;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
  getCart: () => Cart;
}

const CURRENCY = 'THB';
const TAX_RATE = 0.1; // 10% tax

function calculateTotals(items: CartItem[]): { subtotal: number; tax: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = Math.round((subtotal + tax) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total,
  };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: {
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        currency: CURRENCY,
      },

      addItem: (product: Product, quantity: number) => {
        set((state) => {
          const existingItem = state.cart.items.find((item) => item.product_id === product.id);

          let newItems: CartItem[];
          if (existingItem) {
            // Increase quantity if product already in cart
            newItems = state.cart.items.map((item) =>
              item.product_id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            // Add new item
            newItems = [
              ...state.cart.items,
              {
                id: `${product.id}-${Date.now()}`,
                product_id: product.id,
                quantity,
                price: product.price,
                product,
              },
            ];
          }

          const totals = calculateTotals(newItems);
          return {
            cart: {
              items: newItems,
              ...totals,
              currency: CURRENCY,
            },
          };
        });
      },

      removeItem: (itemId: string) => {
        set((state) => {
          const newItems = state.cart.items.filter((item) => item.id !== itemId);
          const totals = calculateTotals(newItems);

          return {
            cart: {
              items: newItems,
              ...totals,
              currency: CURRENCY,
            },
          };
        });
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity < 1) {
          get().removeItem(itemId);
          return;
        }

        set((state) => {
          const newItems = state.cart.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          );
          const totals = calculateTotals(newItems);

          return {
            cart: {
              items: newItems,
              ...totals,
              currency: CURRENCY,
            },
          };
        });
      },

      clearCart: () => {
        set({
          cart: {
            items: [],
            subtotal: 0,
            tax: 0,
            total: 0,
            currency: CURRENCY,
          },
        });
      },

      getCartTotal: () => {
        return get().cart.total;
      },

      getItemCount: () => {
        return get().cart.items.reduce((count, item) => count + item.quantity, 0);
      },

      getCart: () => {
        return get().cart;
      },
    }),
    {
      name: 'shop-cart',
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);

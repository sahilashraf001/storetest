
"use client";

import type { Product, CartItemType } from "@/lib/types";
import React, { createContext, useState, useEffect, ReactNode, useCallback } from "react";

interface CartContextType {
  cartItems: CartItemType[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
  loading: boolean;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("cartItems");
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
        console.error("Failed to parse cart items from localStorage", error);
        localStorage.removeItem("cartItems");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) { // Only save to localStorage after initial load
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems, loading]);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) } // Respect stock
            : item
        );
      }
      return [...prevItems, { ...product, quantity: Math.min(quantity, product.stock) }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === productId) {
            const productStock = item.stock; // Assuming product in cart still has original stock info
            const newQuantity = Math.max(1, Math.min(quantity, productStock)); // Ensure quantity is at least 1 and not over stock
            return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  const getItemCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);


  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getItemCount,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

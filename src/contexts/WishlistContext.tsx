
"use client";

import type { Product, WishlistItemType, User } from "@/lib/types";
import React, { createContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

interface WishlistContextType {
  wishlistItems: WishlistItemType[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isProductInWishlist: (productId: string) => boolean;
  loading: boolean;
}

export const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser, loading: authLoading } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItemType[]>([]);
  const [loading, setLoading] = useState(true);

  const getStorageKey = useCallback((user: User | null) => {
    return user ? `wishlistItems_${user.id}` : null;
  }, []);

  useEffect(() => {
    if (authLoading) return; // Wait for auth state to be determined

    setLoading(true);
    const storageKey = getStorageKey(currentUser);
    if (storageKey) {
      try {
        const storedWishlist = localStorage.getItem(storageKey);
        if (storedWishlist) {
          setWishlistItems(JSON.parse(storedWishlist));
        } else {
          setWishlistItems([]); // Initialize if no wishlist for this user
        }
      } catch (error) {
        console.error("Failed to parse wishlist items from localStorage", error);
        localStorage.removeItem(storageKey);
        setWishlistItems([]);
      }
    } else {
      setWishlistItems([]); // No user, empty wishlist
    }
    setLoading(false);
  }, [currentUser, authLoading, getStorageKey]);

  useEffect(() => {
    if (authLoading || loading) return; // Don't save while loading or if auth is loading

    const storageKey = getStorageKey(currentUser);
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, currentUser, authLoading, loading, getStorageKey]);

  const addToWishlist = useCallback((product: Product) => {
    if (!currentUser) return; // Or prompt to login
    setWishlistItems((prevItems) => {
      if (prevItems.find((item) => item.id === product.id)) {
        return prevItems; // Already in wishlist
      }
      return [...prevItems, { ...product }];
    });
  }, [currentUser]);

  const removeFromWishlist = useCallback((productId: string) => {
    if (!currentUser) return;
    setWishlistItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  }, [currentUser]);

  const isProductInWishlist = useCallback((productId: string) => {
    return wishlistItems.some(item => item.id === productId);
  }, [wishlistItems]);

  return (
    <WishlistContext.Provider
      value={{ wishlistItems, addToWishlist, removeFromWishlist, isProductInWishlist, loading: loading || authLoading }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

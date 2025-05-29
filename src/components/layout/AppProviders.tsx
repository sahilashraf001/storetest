
"use client";

import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { ViewingHistoryProvider } from "@/contexts/ViewingHistoryContext";
import { Toaster } from "@/components/ui/toaster";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ViewingHistoryProvider>
            {children}
            <Toaster />
          </ViewingHistoryProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

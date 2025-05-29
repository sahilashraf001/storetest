
"use client";

import { WishlistContext } from "@/contexts/WishlistContext";
import { useContext } from "react";

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};


"use client";

import { AuthContext } from "@/contexts/AuthContext";
import { useContext } from "react";
import type { User } from "@/lib/types"; // Import User type

// Re-define or import AuthContextType if it's not directly exported from AuthContext
// For simplicity, let's assume AuthContextType is similar to what AuthContext.Provider expects
// Ideally, AuthContextType would be exported from AuthContext.tsx
interface UseAuthContextType {
  currentUser: User | null;
  login: (email: string, pass: string, phone?: string) => Promise<User | null>; // Ensure this matches the updated signature
  logout: () => void;
  signup: (name: string, email: string, pass: string, phone: string) => Promise<boolean>;
  loading: boolean;
  isAuthenticated: boolean;
  checkPassword: (password: string) => Promise<boolean>;
  addAddress: (address: Omit<User['addresses'][0], 'id' | 'isDefault'>) => Promise<boolean>; // Be more specific with address type
  removeAddress: (addressId: string) => Promise<boolean>;
  updateUserInStorage: (updatedUser: User) => void;
}


export const useAuth = (): UseAuthContextType => { // Add return type annotation
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

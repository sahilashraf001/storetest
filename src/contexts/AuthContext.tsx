
"use client";

import type { User, AddressType } from "@/lib/types";
import React, { createContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, pass: string, phone?: string) => Promise<User | null>; // Updated return type
  logout: () => void;
  signup: (name: string, email: string, pass: string, phone: string) => Promise<boolean>;
  loading: boolean;
  isAuthenticated: boolean;
  checkPassword: (password: string) => Promise<boolean>;
  addAddress: (address: Omit<AddressType, 'id' | 'isDefault'>) => Promise<boolean>;
  removeAddress: (addressId: string) => Promise<boolean>;
  updateUserInStorage: (updatedUser: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data
export const MOCK_USERS: User[] = [
  { id: "user_123", name: "Test User", email: "test@example.com", phone: "9876543210", addresses: [], isAdmin: true }, // test@example.com is admin
  { id: "user_456", name: "Jane Doe", email: "jane@example.com", phone: "0123456789", addresses: [], isAdmin: false },
];
export const MOCK_PASSWORDS: { [email: string]: string } = {
  "test@example.com": "password123",
  "jane@example.com": "securepassword",
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUserFromStorage = useCallback(() => {
    try {
      const storedUserString = localStorage.getItem("currentUser");
      if (storedUserString) {
        const loadedUser = JSON.parse(storedUserString) as User;
        if (!loadedUser.addresses) {
          loadedUser.addresses = [];
        }
        const mockUserDefinition = MOCK_USERS.find(u => u.id === loadedUser.id);
        loadedUser.isAdmin = mockUserDefinition ? mockUserDefinition.isAdmin || false : false;
        
        setCurrentUser(loadedUser);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem("currentUser");
      setCurrentUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  const updateUserInStorage = useCallback((updatedUser: User) => {
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  }, []);


  const login = useCallback(async (identifier: string, password: string, phoneParam?: string): Promise<User | null> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let userToLogin: User | undefined = undefined;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/;

    const normalizedIdentifier = identifier?.trim();

    // Try finding by email first if identifier looks like an email
    if (emailRegex.test(normalizedIdentifier)) {
        userToLogin = MOCK_USERS.find(u => u.email === normalizedIdentifier);
    } 
    // If not found by email, or if identifier doesn't look like an email, try by phone if provided.
    // The phoneParam is mostly for the admin login where it is explicitly not used, but we keep the signature.
    // For general login, the identifier itself could be a phone.
    if (!userToLogin && phoneRegex.test(normalizedIdentifier)) {
         userToLogin = MOCK_USERS.find(u => u.phone === normalizedIdentifier);
    }
    
    if (userToLogin && MOCK_PASSWORDS[userToLogin.email] === password) {
        const userWithDetails: User = { 
            ...userToLogin, 
            addresses: userToLogin.addresses || [], 
            isAdmin: userToLogin.isAdmin || false 
        };
        updateUserInStorage(userWithDetails);
        setLoading(false);
        return userWithDetails; // Return user object on success
    }

    setLoading(false);
    return null; // Return null on failure
  }, [updateUserInStorage]);

  const signup = useCallback(async (name: string, email: string, pass: string, phone: string): Promise<boolean> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    if (MOCK_USERS.find(u => u.email === email)) {
      setLoading(false);
      return false; 
    }
    if (MOCK_USERS.find(u => u.phone === phone)) {
      setLoading(false);
      return false; 
    }
    const newUser: User = { id: `user_${Date.now()}`, name, email, phone, addresses: [], isAdmin: false };
    MOCK_USERS.push(newUser); 
    MOCK_PASSWORDS[email] = pass; 
    updateUserInStorage(newUser);
    setLoading(false);
    return true;
  }, [updateUserInStorage]);


  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    router.push(ROUTES.HOME);
  }, [router]);

  const checkPassword = useCallback(async (password: string): Promise<boolean> => {
    if (!currentUser) return false;
    return MOCK_PASSWORDS[currentUser.email] === password;
  }, [currentUser]);

  const addAddress = useCallback(async (addressData: Omit<AddressType, 'id' | 'isDefault'>): Promise<boolean> => {
    if (!currentUser) return false;
    const newAddress: AddressType = {
      ...addressData,
      id: Date.now().toString(), 
      isDefault: currentUser.addresses ? currentUser.addresses.length === 0 : true, 
    };
    const updatedUser: User = {
      ...currentUser,
      addresses: [...(currentUser.addresses || []), newAddress],
    };
    updateUserInStorage(updatedUser);
    return true;
  }, [currentUser, updateUserInStorage]);

  const removeAddress = useCallback(async (addressId: string): Promise<boolean> => {
    if (!currentUser || !currentUser.addresses) return false;
    const updatedAddresses = currentUser.addresses.filter(addr => addr.id !== addressId);
    
    const removedAddress = currentUser.addresses.find(addr => addr.id === addressId);
    if (removedAddress?.isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
    }

    const updatedUser: User = { ...currentUser, addresses: updatedAddresses };
    updateUserInStorage(updatedUser);
    return true;
  }, [currentUser, updateUserInStorage]);


  const isAuthenticated = !!currentUser;

  return (
    <AuthContext.Provider value={{ 
        currentUser, 
        login, 
        logout, 
        signup, 
        loading, 
        isAuthenticated, 
        checkPassword,
        addAddress,
        removeAddress,
        updateUserInStorage
    }}>
      {children}
    </AuthContext.Provider>
  );
};

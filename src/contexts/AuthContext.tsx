
"use client";

import type { User } from "@/lib/types";
import React, { createContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, pass: string, phone: string) => Promise<boolean>; 
  logout: () => void;
  signup: (name: string, email: string, pass: string, phone: string) => Promise<boolean>; 
  loading: boolean;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data - in a real app, this would come from a backend
const MOCK_USERS: User[] = [
  { id: "user_123", name: "Test User", email: "test@example.com", phone: "9876543210" },
  { id: "user_456", name: "Jane Doe", email: "jane@example.com", phone: "0123456789" },
];
// In a real app, passwords would be hashed and stored securely.
// For this mock, we'll just check against a plain text password for a mock user.
const MOCK_PASSWORDS: { [email: string]: string } = {
  "test@example.com": "password123",
  "jane@example.com": "securepassword",
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem("currentUser");
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string, phone: string): Promise<boolean> => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let userToLogin: User | undefined = undefined;

    const normalizedEmail = email?.trim();
    const normalizedPhone = phone?.trim();

    if (normalizedEmail) {
      userToLogin = MOCK_USERS.find(u => u.email === normalizedEmail);
    }
    
    // If user not found by email (or email was not provided) AND phone is provided, try by phone
    if (!userToLogin && normalizedPhone) {
      userToLogin = MOCK_USERS.find(u => u.phone === normalizedPhone);
    }

    if (userToLogin && MOCK_PASSWORDS[userToLogin.email] === password) { // Still use email for MOCK_PASSWORDS key
      setCurrentUser(userToLogin);
      localStorage.setItem("currentUser", JSON.stringify(userToLogin));
      setLoading(false);
      return true;
    }

    setLoading(false);
    return false;
  }, []);

  const signup = useCallback(async (name: string, email: string, pass: string, phone: string): Promise<boolean> => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    if (MOCK_USERS.find(u => u.email === email)) {
      setLoading(false);
      return false; // User already exists with this email
    }
    if (MOCK_USERS.find(u => u.phone === phone)) {
      setLoading(false);
      return false; // User already exists with this phone
    }
    const newUser: User = { id: `user_${Date.now()}`, name, email, phone };
    MOCK_USERS.push(newUser); // Add to mock in-memory store
    MOCK_PASSWORDS[email] = pass; // Store mock password
    setCurrentUser(newUser);
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    setLoading(false);
    return true;
  }, []);


  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    // Optionally, clear other user-specific contexts here
    router.push(ROUTES.HOME);
  }, [router]);

  const isAuthenticated = !!currentUser;

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, signup, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

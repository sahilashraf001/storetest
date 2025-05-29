
"use client";

import React, { createContext, useState, useEffect, ReactNode, useCallback } from "react";

const MAX_HISTORY_LENGTH = 20; // Keep the last 20 viewed items

interface ViewingHistoryContextType {
  viewingHistory: string[]; // Array of product IDs
  addToHistory: (productId: string) => void;
  loading: boolean;
}

export const ViewingHistoryContext = createContext<ViewingHistoryContextType | undefined>(undefined);

export const ViewingHistoryProvider = ({ children }: { children: ReactNode }) => {
  const [viewingHistory, setViewingHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("viewingHistory");
      if (storedHistory) {
        setViewingHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
        console.error("Failed to parse viewing history from localStorage", error);
        localStorage.removeItem("viewingHistory");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
        localStorage.setItem("viewingHistory", JSON.stringify(viewingHistory));
    }
  }, [viewingHistory, loading]);

  const addToHistory = useCallback((productId: string) => {
    setViewingHistory((prevHistory) => {
      // Remove product if it already exists to move it to the front (most recent)
      const updatedHistory = prevHistory.filter(id => id !== productId);
      // Add new product ID to the beginning
      const newHistory = [productId, ...updatedHistory];
      // Limit history length
      return newHistory.slice(0, MAX_HISTORY_LENGTH);
    });
  }, []);

  return (
    <ViewingHistoryContext.Provider value={{ viewingHistory, addToHistory, loading }}>
      {children}
    </ViewingHistoryContext.Provider>
  );
};

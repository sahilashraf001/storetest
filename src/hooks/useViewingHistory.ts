
"use client";

import { ViewingHistoryContext } from "@/contexts/ViewingHistoryContext";
import { useContext } from "react";

export const useViewingHistory = () => {
  const context = useContext(ViewingHistoryContext);
  if (context === undefined) {
    throw new Error("useViewingHistory must be used within a ViewingHistoryProvider");
  }
  return context;
};

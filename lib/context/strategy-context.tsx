"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface StrategyContextType {
  selectedStrategyId: string | null;
  setSelectedStrategyId: (id: string | null) => void;
  selectedAccountId: string | null;
  setSelectedAccountId: (id: string | null) => void;
}

const StrategyContext = createContext<StrategyContextType | undefined>(
  undefined
);

export function StrategyProvider({ children }: { children: ReactNode }) {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(
    null
  );
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );

  return (
    <StrategyContext.Provider
      value={{
        selectedStrategyId,
        setSelectedStrategyId,
        selectedAccountId,
        setSelectedAccountId,
      }}
    >
      {children}
    </StrategyContext.Provider>
  );
}

export function useStrategyContext() {
  const context = useContext(StrategyContext);
  if (!context) {
    throw new Error("useStrategyContext must be used within StrategyProvider");
  }
  return context;
}


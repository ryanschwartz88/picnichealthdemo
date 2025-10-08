"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useStrategyContext } from "@/lib/context/strategy-context";
import { useAccounts } from "@/lib/hooks/use-accounts";

interface AppHeaderProps {
  onNewStrategy?: () => void;
}

export function AppHeader({ onNewStrategy }: AppHeaderProps) {
  const { setSelectedStrategyId, setSelectedAccountId, selectedAccountId } = useStrategyContext();
  const { accounts } = useAccounts();

  const handleNewStrategy = () => {
    setSelectedStrategyId(null);
    setSelectedAccountId(null);
    onNewStrategy?.();
  };

  const currentAccount = accounts.find((account) => account.id === selectedAccountId);
  const displayName = currentAccount?.name || "Strategy Planner";

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <span className="text-sm font-medium text-muted-foreground">{displayName}</span>
      </div>
      <Button variant="default" size="sm" onClick={handleNewStrategy}>
        <PlusIcon className="mr-2 h-4 w-4" /> New Strategy
      </Button>
    </header>
  );
}


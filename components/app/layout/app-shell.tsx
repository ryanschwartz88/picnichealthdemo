"use client";

import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/layout/sidebar";
import { AppHeader } from "@/components/app/layout/header";
import { StrategyProvider, useStrategyContext } from "@/lib/context/strategy-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AccountForm } from "@/components/app/forms/account-form";
import { useAccounts } from "@/lib/hooks/use-accounts";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <StrategyProvider>
      <AppShellInner>{children}</AppShellInner>
    </StrategyProvider>
  );
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const { mutate } = useAccounts();
  const { setSelectedStrategyId, setSelectedAccountId } = useStrategyContext();

  const handleAccountCreated = async (values: { name: string }) => {
    try {
      setIsCreatingAccount(true);
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to create account" }));
        throw new Error(error.error || "Failed to create account");
      }

      const result = (await response.json()) as { data?: { id: string } };

      await mutate();
      if (result?.data?.id) {
        setSelectedAccountId(result.data.id);
        setSelectedStrategyId(null);
      }
      setAccountDialogOpen(false);
    } catch (error) {
      console.error("Failed to create account", error);
      throw error;
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleNewStrategy = () => {
    setSelectedStrategyId(null);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <AppSidebar onRequestNewAccount={() => setAccountDialogOpen(true)} />
        <SidebarInset className="overflow-hidden">
          <AppHeader onNewStrategy={handleNewStrategy} />
          <div className="flex flex-1 flex-col overflow-auto">{children}</div>
        </SidebarInset>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Account</DialogTitle>
          </DialogHeader>
          <AccountForm onSubmit={handleAccountCreated} isSubmitting={isCreatingAccount} />
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}


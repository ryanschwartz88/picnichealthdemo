"use client";

import Image from "next/image";
import { useState } from "react";
import { PlusIcon, PanelLeftCloseIcon, Building2Icon, ChevronRightIcon, MoreHorizontalIcon, EditIcon, TrashIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
  useSidebar,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useStrategies } from "@/lib/hooks/use-strategies";
import { useStrategyContext } from "@/lib/context/strategy-context";
import { useAccounts } from "@/lib/hooks/use-accounts";
import { groupStrategiesByAccount } from "@/lib/utils";

type AppSidebarProps = {
  onRequestNewAccount?: () => void;
};

export function AppSidebar({ onRequestNewAccount }: AppSidebarProps) {
  const { strategies, isLoading, mutate: mutateStrategies } = useStrategies();
  const { accounts, mutate } = useAccounts();
  const { selectedStrategyId, setSelectedStrategyId } = useStrategyContext();
  const { toggleSidebar } = useSidebar();
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<{ id: string; name: string } | null>(null);
  const [newAccountName, setNewAccountName] = useState("");

  const accountStrategies = groupStrategiesByAccount(strategies);

  const handleRenameAccount = async () => {
    if (!selectedAccount || !newAccountName.trim()) return;

    try {
      const response = await fetch(`/api/accounts?id=${selectedAccount.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newAccountName }),
      });

      if (!response.ok) {
        throw new Error("Failed to rename account");
      }

      await mutate();
      setRenameDialogOpen(false);
      setSelectedAccount(null);
      setNewAccountName("");
    } catch (error) {
      console.error("Error renaming account:", error);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm("Are you sure you want to delete this account and all its strategies?")) {
      return;
    }

    try {
      const response = await fetch(`/api/accounts?id=${accountId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      // If the selected strategy belongs to this account, clear selection
      const deletedAccountStrategies = accountStrategies.get(accountId) ?? [];
      if (deletedAccountStrategies.some((s) => s.id === selectedStrategyId)) {
        setSelectedStrategyId(null);
      }

      await mutate();
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  const handleDeleteStrategy = async (strategyId: string) => {
    if (!confirm("Are you sure you want to delete this strategy?")) {
      return;
    }

    try {
      const response = await fetch(`/api/strategies?id=${strategyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete strategy");
      }

      // If the deleted strategy was selected, clear selection
      if (selectedStrategyId === strategyId) {
        setSelectedStrategyId(null);
      }

      await mutateStrategies();
    } catch (error) {
      console.error("Error deleting strategy:", error);
    }
  };

  return (
    <Sidebar collapsible="offcanvas" className="border-r">
      <SidebarHeader className="border-b px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Image
              src="/picnichealth_logo.jpg"
              alt="PicnicHealth"
              width={32}
              height={32}
              className="rounded-md"
            />
            <span className="font-semibold text-sm">PicnicHealth</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleSidebar}
          >
            <PanelLeftCloseIcon className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <div className="py-2 space-y-2">
          <Button
            className="w-full justify-start gap-2"
            variant="default"
            onClick={() => setSelectedStrategyId(null)}
          >
            <PlusIcon className="h-4 w-4" />
            New Strategy
          </Button>
          <Button
            className="w-full justify-start gap-2"
            variant="outline"
            onClick={() => onRequestNewAccount?.()}
          >
            <Building2Icon className="h-4 w-4" />
            New Account
          </Button>
        </div>

        <div className="pt-2">
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Accounts
          </div>
          {accounts.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Add an account to begin
            </div>
          ) : (
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {accounts.map((account) => {
                    const accountStrategyList = accountStrategies.get(account.id) ?? [];

                    return (
                      <Collapsible key={account.id} defaultOpen className="group/collapsible">
                        <SidebarMenuItem>
                          <div className="flex items-center gap-1">
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton className="flex-1">
                                <ChevronRightIcon className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                <Building2Icon className="h-4 w-4" />
                                <span className="truncate">{account.name}</span>
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                  <MoreHorizontalIcon className="h-4 w-4" />
                                  <span className="sr-only">Account options</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedAccount({ id: account.id, name: account.name });
                                    setNewAccountName(account.name);
                                    setRenameDialogOpen(true);
                                  }}
                                >
                                  <EditIcon className="mr-2 h-4 w-4" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteAccount(account.id)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <TrashIcon className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {isLoading ? (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                  Loading...
                                </div>
                              ) : accountStrategyList.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-muted-foreground italic">
                                  No strategies yet
                                </div>
                              ) : (
                                accountStrategyList.map((strategy) => (
                                  <SidebarMenuSubItem key={strategy.id}>
                                    <div className="flex items-center gap-1 group/strategy">
                                      <SidebarMenuSubButton
                                        asChild
                                        isActive={selectedStrategyId === strategy.id}
                                        onClick={() => setSelectedStrategyId(strategy.id)}
                                        className="flex-1"
                                      >
                                        <button className="w-full text-left">
                                          <span className="truncate">{strategy.title}</span>
                                        </button>
                                      </SidebarMenuSubButton>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 shrink-0 opacity-0 group-hover/strategy:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteStrategy(strategy.id);
                                        }}
                                      >
                                        <TrashIcon className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                        <span className="sr-only">Delete strategy</span>
                                      </Button>
                                    </div>
                                  </SidebarMenuSubItem>
                                ))
                              )}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t px-3 py-2">
        <div className="text-xs text-muted-foreground">
          Account Strategy Planning
        </div>
      </SidebarFooter>

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Account</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              placeholder="Account name"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRenameAccount();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameAccount}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}

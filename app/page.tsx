"use client";

import { AppShell } from "@/components/app/layout/app-shell";
import { StrategyChat } from "@/components/app/strategy/strategy-chat";

export default function Home() {
  return (
    <AppShell>
      <StrategyChat />
    </AppShell>
  );
}

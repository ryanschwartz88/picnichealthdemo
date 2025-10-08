import { StrategyCard } from "./strategy-card";

export function StrategyDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <StrategyCard title="Priorities" />
      <StrategyCard title="Key Assets" />
      <StrategyCard title="Opportunities" />
      <StrategyCard title="Key Contacts" />
    </div>
  );
}


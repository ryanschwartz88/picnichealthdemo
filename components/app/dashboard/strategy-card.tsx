import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StrategyCardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function StrategyCard({ title, description, children }: StrategyCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}


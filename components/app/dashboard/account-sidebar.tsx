import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AccountSidebar() {
  return (
    <aside className="space-y-4">
      <Card>
        <CardContent>
          <Button variant="outline" className="w-full">
            Add Account
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
}


import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: boolean;
};

export function StatTile({ icon: Icon, label, value, accent }: Props) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full bg-muted",
          )}
        >
          <Icon className={cn("size-4", accent ? "text-amber-500" : "text-muted-foreground")} />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-semibold">{value}</p>
          <p className="truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

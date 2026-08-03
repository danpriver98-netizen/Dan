import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  delta,
  deltaPositive,
  icon: Icon,
  accent = "teal",
}: {
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  icon: LucideIcon;
  accent?: "teal" | "amber" | "rose" | "blue";
}) {
  const accents: Record<string, string> = {
    teal: "bg-teal/10 text-teal",
    amber: "bg-amber-500/10 text-amber-500",
    rose: "bg-rose-500/10 text-rose-500",
    blue: "bg-blue-500/10 text-blue-500",
  };
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", accents[accent])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-xl font-bold leading-tight">{value}</p>
          {delta && (
            <p
              className={cn(
                "text-xs font-medium",
                deltaPositive ? "text-emerald-500" : "text-rose-500"
              )}
            >
              {delta}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

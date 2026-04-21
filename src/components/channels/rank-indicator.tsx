import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function RankIndicator({
  current,
  previous,
  className,
}: {
  current?: number | null;
  previous?: number | null;
  className?: string;
}) {
  if (!current || !previous) {
    return (
      <span className={cn("inline-flex items-center gap-0.5 text-xs text-muted-foreground", className)}>
        <Minus className="h-3 w-3" />
      </span>
    );
  }
  const diff = previous - current;
  if (diff === 0) {
    return (
      <span className={cn("inline-flex items-center gap-0.5 text-xs text-muted-foreground", className)}>
        <Minus className="h-3 w-3" />
      </span>
    );
  }
  if (diff > 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400",
          className,
        )}
      >
        <ArrowUp className="h-3 w-3" />
        {diff}
      </span>
    );
  }
  return (
    <span
      className={cn("inline-flex items-center gap-0.5 text-xs font-medium text-red-600 dark:text-red-400", className)}
    >
      <ArrowDown className="h-3 w-3" />
      {Math.abs(diff)}
    </span>
  );
}

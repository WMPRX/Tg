import Link from "next/link";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
  iconOnly = false,
}: {
  href?: string;
  className?: string;
  iconOnly?: boolean;
}) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 font-semibold", className)}>
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Send className="h-4 w-4" strokeWidth={2.5} />
      </span>
      {!iconOnly && <span className="text-lg tracking-tight">TgDir</span>}
    </Link>
  );
}

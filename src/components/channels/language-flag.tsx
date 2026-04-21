import { LOCALE_LABELS, type Locale } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function LanguageFlag({ code, className }: { code: string; className?: string }) {
  const key = code.toLowerCase() as Locale;
  const meta = LOCALE_LABELS[key];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium uppercase", className)}>
      <span className="text-base leading-none">{meta?.flag ?? "🏳️"}</span>
      <span>{code.toUpperCase()}</span>
    </span>
  );
}

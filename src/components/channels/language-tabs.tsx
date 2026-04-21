"use client";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/routing";
import { LOCALE_LABELS, type Locale } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type LanguageTabItem = { code: string; count: number };

export function LanguageTabs({ items, active }: { items: LanguageTabItem[]; active?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const search = useSearchParams();

  const activeCode = active ?? search.get("lang") ?? "all";

  const onClick = (code: string) => {
    const params = new URLSearchParams(search.toString());
    if (code === "all") params.delete("lang");
    else params.set("lang", code);
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const totalCount = items.reduce((sum, it) => sum + it.count, 0);

  return (
    <div className="scrollbar-hide -mx-4 overflow-x-auto border-b px-4">
      <div className="flex min-w-max gap-1">
        <TabButton code="all" active={activeCode === "all"} onClick={() => onClick("all")}>
          <span className="text-base leading-none">🌐</span>
          <span>Global</span>
          <span className="text-xs text-muted-foreground">({totalCount})</span>
        </TabButton>
        {items.map((it) => {
          const label = LOCALE_LABELS[it.code as Locale];
          return (
            <TabButton
              key={it.code}
              code={it.code}
              active={activeCode === it.code}
              onClick={() => onClick(it.code)}
            >
              <span className="text-base leading-none">{label?.flag ?? "🏳️"}</span>
              <span>{label?.name ?? it.code.toUpperCase()}</span>
              <span className="text-xs text-muted-foreground">({it.count})</span>
            </TabButton>
          );
        })}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  code: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition-colors",
        active
          ? "border-primary font-semibold text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

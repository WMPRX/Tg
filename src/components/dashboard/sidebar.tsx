"use client";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Radio, Plus, Crown, Settings } from "lucide-react";

export function DashboardSidebar() {
  const t = useTranslations("dashboard");
  const tNav = useTranslations("nav");
  const pathname = usePathname();

  const items = [
    { href: "/dashboard", label: t("title"), icon: LayoutDashboard },
    { href: "/dashboard/channels", label: t("myChannelsTitle"), icon: Radio },
    { href: "/dashboard/channels/new", label: tNav("addChannel"), icon: Plus },
    { href: "/dashboard/premium", label: tNav("premium"), icon: Crown },
    { href: "/dashboard/settings", label: tNav("settings"), icon: Settings },
  ] as const;

  return (
    <nav className="flex flex-col gap-1">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary/10 font-medium text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

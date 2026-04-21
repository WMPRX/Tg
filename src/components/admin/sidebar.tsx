"use client";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/constants";
import {
  LayoutDashboard,
  Radio,
  Inbox,
  FolderTree,
  Tags,
  TrendingUp,
  Users,
  Crown,
  Settings,
  Search,
  FileText,
} from "lucide-react";

export function AdminSidebar({ role }: { role: UserRole }) {
  const t = useTranslations("admin");
  const pathname = usePathname();

  const items = [
    { href: "/admin", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/admin/channels", label: t("channels"), icon: Radio },
    { href: "/admin/submissions", label: t("submissions"), icon: Inbox },
    { href: "/admin/categories", label: t("categories"), icon: FolderTree },
    { href: "/admin/tags", label: t("tags"), icon: Tags },
    { href: "/admin/trends", label: t("trends"), icon: TrendingUp },
    ...(role === "SUPER_ADMIN" || role === "ADMIN"
      ? [
          { href: "/admin/users", label: t("users"), icon: Users },
          { href: "/admin/premium", label: t("premium"), icon: Crown },
          { href: "/admin/settings", label: t("settings"), icon: Settings },
          { href: "/admin/seo", label: t("seo"), icon: Search },
          { href: "/admin/pages", label: t("pages"), icon: FileText },
        ]
      : []),
  ] as const;

  return (
    <nav className="flex flex-col gap-1">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
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

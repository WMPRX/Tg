"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { Search, Menu, X, User, LogOut, LayoutDashboard, Plus } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Link, usePathname } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links: ReadonlyArray<{ href: "/channels" | "/categories" | "/search" | "/premium"; label: string; muted?: boolean }> = [
    { href: "/channels", label: t("channels") },
    { href: "/categories", label: t("categories") },
    { href: "/search", label: t("search") },
    { href: "/premium", label: t("premium"), muted: true },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur transition-shadow",
        scrolled && "shadow-sm",
      )}
    >
      <div className="container flex h-14 items-center gap-4">
        <Logo />
        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  link.muted && !active && "opacity-70",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link href="/search" aria-label={t("search")}>
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
          </Link>
          <LanguageSwitcher />
          <ThemeToggle />

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="User menu">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>{session.user?.name ?? session.user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" /> {t("dashboard")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/channels/new">
                    <Plus className="h-4 w-4" /> {t("addChannel")}
                  </Link>
                </DropdownMenuItem>
                {(session.user as { role?: string } | null | undefined)?.role &&
                  ["ADMIN", "SUPER_ADMIN", "EDITOR"].includes(
                    (session.user as { role?: string }).role as string,
                  ) && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <User className="h-4 w-4" /> {t("admin")}
                      </Link>
                    </DropdownMenuItem>
                  )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="h-4 w-4" /> {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  {t("login")}
                </Button>
              </Link>
              <Link href="/register" className="hidden sm:block">
                <Button size="sm">{t("register")}</Button>
              </Link>
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {mobileOpen && (
        <div className="container border-t py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm hover:bg-accent"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!session && (
              <>
                <Link href="/login" className="rounded-md px-3 py-2 text-sm hover:bg-accent">
                  {t("login")}
                </Link>
                <Link href="/register" className="rounded-md px-3 py-2 text-sm hover:bg-accent">
                  {t("register")}
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

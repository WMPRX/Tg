"use client";
import * as React from "react";
import { useLocale } from "next-intl";
import { Globe, Check } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/routing";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const current = LOCALE_LABELS[locale];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="text-base leading-none">{current.flag}</span>
          <span className="hidden sm:inline">{current.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {LOCALES.map((code) => {
          const label = LOCALE_LABELS[code];
          const isActive = code === locale;
          return (
            <DropdownMenuItem
              key={code}
              onSelect={() => router.replace(pathname, { locale: code })}
              className="gap-2"
            >
              <span className="text-base leading-none">{label.flag}</span>
              <span className="flex-1">{label.name}</span>
              {isActive && <Check className="h-4 w-4 opacity-60" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

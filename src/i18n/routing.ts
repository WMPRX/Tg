import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/constants";

export const routing = defineRouting({
  locales: LOCALES as unknown as string[],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

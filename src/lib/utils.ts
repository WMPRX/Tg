import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { LOCALES, DEFAULT_LOCALE, type Locale } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 12345 -> "12.3K", 1234567 -> "1.2M"
 */
export function formatMemberCount(n: number): string {
  if (!n || n < 0) return "0";
  if (n < 1000) return String(n);
  if (n < 10_000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  if (n < 1_000_000) return Math.round(n / 1000) + "K";
  if (n < 10_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  return Math.round(n / 1_000_000) + "M";
}

/**
 * JSON string veya object'ten, istenen dil veya fallback ile localize edilmiş değeri döner.
 */
export function localize(
  value: string | Record<string, unknown> | null | undefined,
  locale: string,
  fallback: string = DEFAULT_LOCALE,
): string {
  if (!value) return "";
  let obj: Record<string, unknown>;
  if (typeof value === "string") {
    try {
      obj = JSON.parse(value);
    } catch {
      return value;
    }
  } else {
    obj = value;
  }
  if (typeof obj !== "object" || obj === null) return "";
  if (obj[locale] && typeof obj[locale] === "string") return obj[locale] as string;
  if (obj[fallback] && typeof obj[fallback] === "string") return obj[fallback] as string;
  const firstKey = Object.keys(obj)[0];
  return firstKey ? (obj[firstKey] as string) : "";
}

export function parseJSON<T = unknown>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function isValidLocale(l: string): l is Locale {
  return (LOCALES as readonly string[]).includes(l);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function generateOrderNumber(): string {
  const now = new Date();
  const yyyymmdd =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `PRE-${yyyymmdd}-${rand}`;
}

export function formatCurrency(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function relativeTime(date: Date | string | null | undefined, locale: string = "en"): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Math.round((d.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (abs < 60) return rtf.format(diff, "seconds");
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minutes");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hours");
  if (abs < 2592000) return rtf.format(Math.round(diff / 86400), "days");
  if (abs < 31536000) return rtf.format(Math.round(diff / 2592000), "months");
  return rtf.format(Math.round(diff / 31536000), "years");
}

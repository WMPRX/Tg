export const LOCALES = ["tr", "en", "ru", "zh", "id", "vi", "es", "ar", "de", "fr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "tr";

export const LOCALE_LABELS: Record<Locale, { name: string; flag: string }> = {
  tr: { name: "Türkçe", flag: "🇹🇷" },
  en: { name: "English", flag: "🇬🇧" },
  ru: { name: "Русский", flag: "🇷🇺" },
  zh: { name: "中文", flag: "🇨🇳" },
  id: { name: "Bahasa Indonesia", flag: "🇮🇩" },
  vi: { name: "Tiếng Việt", flag: "🇻🇳" },
  es: { name: "Español", flag: "🇪🇸" },
  ar: { name: "العربية", flag: "🇸🇦" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  fr: { name: "Français", flag: "🇫🇷" },
};

export const RTL_LOCALES: Locale[] = ["ar"];

export const CHANNEL_TYPES = ["CHANNEL", "GROUP", "SUPERGROUP"] as const;
export type ChannelType = (typeof CHANNEL_TYPES)[number];

export const USER_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const SUBMISSION_STATUSES = ["PENDING", "APPROVED", "REJECTED", "REVISION_REQUESTED"] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "ACTIVE",
  "EXPIRED",
  "CANCELLED",
  "REFUNDED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = [
  "STRIPE",
  "PAYPAL",
  "CRYPTO",
  "BANK_TRANSFER",
  "PAPARA",
  "MANUAL",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

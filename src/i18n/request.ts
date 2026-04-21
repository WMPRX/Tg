import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { LOCALES } from "@/lib/constants";

export default getRequestConfig(async ({ locale }) => {
  if (!locale || !(LOCALES as readonly string[]).includes(locale)) notFound();
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});

import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/constants";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale =
    requested && (LOCALES as readonly string[]).includes(requested)
      ? requested
      : DEFAULT_LOCALE;
  if (!(LOCALES as readonly string[]).includes(locale)) notFound();
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});

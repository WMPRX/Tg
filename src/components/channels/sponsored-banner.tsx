import { useTranslations } from "next-intl";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";

export function SponsoredBanner() {
  const t = useTranslations("promoBar");
  return (
    <Link
      href="/premium"
      className="group flex items-center gap-3 rounded-xl border border-amber-300/60 bg-gradient-to-r from-amber-100 via-amber-200 to-yellow-200 px-4 py-3 text-amber-950 shadow-sm transition-shadow hover:shadow-md dark:border-amber-700/40 dark:from-amber-900/30 dark:via-amber-800/30 dark:to-yellow-900/30 dark:text-amber-100"
    >
      <Sparkles className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-300" />
      <span className="flex-1 text-sm font-medium">{t("title")}</span>
      <span className="inline-flex items-center gap-1 rounded-md bg-amber-950 px-3 py-1.5 text-xs font-semibold text-amber-50 transition-transform group-hover:translate-x-0.5 dark:bg-amber-100 dark:text-amber-950">
        {t("cta")} <ArrowRight className="h-3 w-3" />
      </span>
    </Link>
  );
}

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Sparkles } from "lucide-react";

export function PromoBar() {
  const t = useTranslations("promoBar");
  return (
    <div className="relative w-full bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-300 text-amber-950 dark:from-amber-900/80 dark:via-amber-800/80 dark:to-yellow-800/80 dark:text-amber-50">
      <div className="container flex items-center gap-3 py-2.5">
        <Sparkles className="h-5 w-5 shrink-0 fill-amber-500/50 text-amber-700 dark:text-amber-300" />
        <p className="flex-1 truncate text-sm font-medium">{t("title")}</p>
        <Link
          href="/premium"
          className="shrink-0 rounded-md bg-amber-950 px-3 py-1.5 text-xs font-semibold text-amber-50 transition-colors hover:bg-amber-900 dark:bg-amber-50 dark:text-amber-950 dark:hover:bg-amber-100"
        >
          {t("cta")}
        </Link>
      </div>
    </div>
  );
}

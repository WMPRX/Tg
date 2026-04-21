import { Check, X, Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { localize, formatCurrency, parseJSON, cn } from "@/lib/utils";

export type PlanFeatures = {
  listingPosition?: "top" | "highlighted" | "normal";
  featuredBadge?: boolean;
  highlightColor?: string;
  bannerSlot?: boolean;
  priorityInCategory?: boolean;
  detailedStats?: boolean;
  maxChannels?: number;
};

type Plan = {
  id: number;
  slug: string;
  name: string;
  description: string;
  durationDays: number;
  price: number;
  currency: string;
  features: string;
};

const FEATURE_KEYS: { key: keyof PlanFeatures; label: string }[] = [
  { key: "listingPosition", label: "feature_top" },
  { key: "featuredBadge", label: "feature_badge" },
  { key: "highlightColor", label: "feature_highlight" },
  { key: "bannerSlot", label: "feature_banner" },
  { key: "priorityInCategory", label: "feature_priority" },
  { key: "detailedStats", label: "feature_stats" },
];

export async function PricingTable({
  plans,
  locale,
  buyHref = "/dashboard/premium",
}: {
  plans: Plan[];
  locale: string;
  buyHref?: string;
}) {
  const t = await getTranslations({ locale, namespace: "premium" });
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {plans.map((plan, i) => {
        const features = parseJSON<PlanFeatures>(plan.features, {});
        const highlighted = i === 2; // "Gold" öne çıkarılmış
        return (
          <Card
            key={plan.id}
            className={cn(
              "flex h-full flex-col p-6 transition-shadow hover:shadow-md",
              highlighted && "border-amber-400 ring-1 ring-amber-300/50",
            )}
          >
            {highlighted && (
              <div className="mb-3 inline-flex items-center gap-1 self-start rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                Popular
              </div>
            )}
            <h3 className="text-lg font-semibold">{localize(plan.name, locale)}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{localize(plan.description, locale)}</p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-bold">{formatCurrency(plan.price, plan.currency)}</span>
              <span className="text-xs text-muted-foreground">/ {t("durationDays", { days: plan.durationDays })}</span>
            </div>
            <ul className="mt-5 space-y-2 text-sm">
              {FEATURE_KEYS.map((f) => {
                const raw = features[f.key];
                const enabled = Boolean(raw);
                return (
                  <li key={f.key} className={cn("flex items-center gap-2", !enabled && "text-muted-foreground")}>
                    {enabled ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground/50" />
                    )}
                    <span>{t(f.label as Parameters<typeof t>[0])}</span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6">
              <Link href={`${buyHref}?plan=${plan.slug}`}>
                <Button className="w-full" variant={highlighted ? "premium" : "default"}>
                  {t("buyNow")}
                </Button>
              </Link>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

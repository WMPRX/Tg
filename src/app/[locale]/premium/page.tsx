import { getTranslations } from "next-intl/server";
import { Sparkles, TrendingUp, BarChart3, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PricingTable } from "@/components/premium/pricing-table";

export const revalidate = 600;

export default async function PremiumLandingPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "premium" });
  const plans = await prisma.premiumPlan.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  const advantages = [
    { icon: <TrendingUp className="h-5 w-5" />, key: "feature_top" },
    { icon: <Star className="h-5 w-5" />, key: "feature_badge" },
    { icon: <Sparkles className="h-5 w-5" />, key: "feature_banner" },
    { icon: <BarChart3 className="h-5 w-5" />, key: "feature_stats" },
  ] as const;

  return (
    <div>
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-amber-50 via-background to-white dark:from-amber-950/20 dark:via-background dark:to-background">
        <div className="container py-16 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">{t("heroTitle")}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">{t("heroSubtitle")}</p>
          <div className="mt-6">
            <Link href="/register">
              <Button size="lg" variant="premium">
                {t("cta")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid gap-4 md:grid-cols-4">
          {advantages.map((a) => (
            <Card key={a.key} className="flex flex-col items-start gap-2 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                {a.icon}
              </div>
              <div className="font-semibold">{t(a.key as Parameters<typeof t>[0])}</div>
            </Card>
          ))}
        </div>
      </section>

      <section className="container pb-16">
        <h2 className="mb-6 text-center text-2xl font-bold md:text-3xl">{t("plansTitle")}</h2>
        <PricingTable plans={plans} locale={locale} />
      </section>
    </div>
  );
}

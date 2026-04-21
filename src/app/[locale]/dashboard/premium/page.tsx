import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import { PricingTable } from "@/components/premium/pricing-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPremiumPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "premium" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tDash = await getTranslations({ locale, namespace: "dashboard" });
  const user = (await getCurrentUser())!;

  const [plans, orders] = await Promise.all([
    prisma.premiumPlan.findMany({ where: { isActive: true }, orderBy: { price: "asc" } }),
    prisma.premiumOrder.findMany({
      where: { userId: Number(user.id) },
      include: { plan: true, channel: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{tNav("premium")}</h1>
        <p className="text-sm text-muted-foreground">{t("plansTitle")}</p>
      </div>

      <PricingTable plans={plans} locale={locale} buyHref="/dashboard/premium/checkout" />

      {orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{tDash("status")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                  <div>
                    <div className="font-medium">#{o.orderNumber}</div>
                    <div className="text-xs text-muted-foreground">
                      @{o.channel?.username ?? "—"} · {o.plan?.durationDays ?? "?"}d
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium tabular-nums">
                      {formatCurrency(o.amount, o.currency)}
                    </span>
                    <Badge variant={o.status === "ACTIVE" || o.status === "PAID" ? "default" : "secondary"}>
                      {o.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

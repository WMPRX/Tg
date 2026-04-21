import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumOrdersList } from "@/components/admin/premium-orders-list";
import { CouponsManager } from "@/components/admin/coupons-manager";
import { formatCurrency, localize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPremiumPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "admin" });

  const [plans, orders, coupons] = await Promise.all([
    prisma.premiumPlan.findMany({ orderBy: { price: "asc" } }),
    prisma.premiumOrder.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, username: true } },
        plan: true,
        channel: { select: { id: true, username: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{t("premium")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Plans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {plans.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
              <div>
                <div className="font-medium">{localize(p.name, locale)}</div>
                <div className="text-xs text-muted-foreground">
                  {p.slug} · {p.durationDays} days
                </div>
              </div>
              <div className="font-semibold tabular-nums">{formatCurrency(p.price, p.currency)}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <PremiumOrdersList
            orders={orders.map((o) => ({
              id: o.id,
              orderNumber: o.orderNumber,
              amount: o.amount,
              currency: o.currency,
              status: o.status,
              paymentMethod: o.paymentMethod,
              createdAt: o.createdAt.toISOString(),
              user: o.user,
              channel: o.channel,
              plan: { name: localize(o.plan.name, locale), durationDays: o.plan.durationDays },
            }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <CouponsManager
            items={coupons.map((c) => ({
              id: c.id,
              code: c.code,
              discountType: c.discountType,
              discountValue: c.discountValue,
              usageLimit: c.usageLimit,
              usageCount: c.usageCount,
              validUntil: c.validUntil ? c.validUntil.toISOString() : null,
              isActive: c.isActive,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}

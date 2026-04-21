import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMemberCount, formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "admin" });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalChannels,
    totalGroups,
    totalMembersAgg,
    todayAdded,
    totalUsers,
    pending,
    activePremium,
    monthRevenueAgg,
  ] = await Promise.all([
    prisma.channel.count({ where: { type: "CHANNEL" } }),
    prisma.channel.count({ where: { type: { in: ["GROUP", "SUPERGROUP"] } } }),
    prisma.channel.aggregate({ _sum: { memberCount: true } }),
    prisma.channel.count({ where: { createdAt: { gte: dayStart } } }),
    prisma.user.count(),
    prisma.channelSubmission.count({ where: { status: "PENDING" } }),
    prisma.channel.count({ where: { isPremium: true, premiumUntil: { gt: now } } }),
    prisma.premiumOrder.aggregate({
      _sum: { amount: true },
      where: { status: { in: ["PAID", "ACTIVE"] }, createdAt: { gte: monthStart } },
    }),
  ]);

  const stats = [
    { label: t("totalChannels"), value: totalChannels },
    { label: t("totalGroups"), value: totalGroups },
    { label: t("totalMembers"), value: formatMemberCount(totalMembersAgg._sum.memberCount ?? 0) },
    { label: t("todayAdded"), value: todayAdded },
    { label: t("totalUsers"), value: totalUsers },
    { label: t("pendingSubmissions"), value: pending },
    { label: t("activePremium"), value: activePremium },
    { label: t("monthRevenue"), value: formatCurrency(monthRevenueAgg._sum.amount ?? 0) },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("dashboard")}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tabular-nums">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

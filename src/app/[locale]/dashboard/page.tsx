import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { formatMemberCount } from "@/lib/utils";

export default async function DashboardIndexPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const user = (await getCurrentUser())!;

  const [channelCount, submissionCount, activePremium, totalMembers] = await Promise.all([
    prisma.channel.count({ where: { submittedById: Number(user.id) } }),
    prisma.channelSubmission.count({ where: { userId: Number(user.id), status: "PENDING" } }),
    prisma.channel.count({
      where: { submittedById: Number(user.id), isPremium: true, premiumUntil: { gt: new Date() } },
    }),
    prisma.channel
      .aggregate({ _sum: { memberCount: true }, where: { submittedById: Number(user.id) } })
      .then((r) => r._sum.memberCount ?? 0),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("welcome", { name: user.name ?? user.email ?? "" })}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/channels/new">{tNav("addChannel")}</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("myChannelsTitle")} value={channelCount} />
        <StatCard label={t("status_PENDING")} value={submissionCount} />
        <StatCard label={tNav("premium")} value={activePremium} />
        <StatCard label="ÜYE" value={formatMemberCount(totalMembers)} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium uppercase text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

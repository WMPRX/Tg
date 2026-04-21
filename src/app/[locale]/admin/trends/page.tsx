import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMemberCount } from "@/lib/utils";
import { RankIndicator } from "@/components/channels/rank-indicator";

export const dynamic = "force-dynamic";

export default async function AdminTrendsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "admin" });

  const [topDaily, topWeekly, topMonthly] = await Promise.all([
    prisma.channel.findMany({ orderBy: { dailyGrowth: "desc" }, take: 10 }),
    prisma.channel.findMany({ orderBy: { weeklyGrowth: "desc" }, take: 10 }),
    prisma.channel.findMany({ orderBy: { monthlyGrowth: "desc" }, take: 10 }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{t("trends")}</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <TrendCard title="Daily growth" data={topDaily} field="dailyGrowth" />
        <TrendCard title="Weekly growth" data={topWeekly} field="weeklyGrowth" />
        <TrendCard title="Monthly growth" data={topMonthly} field="monthlyGrowth" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ranking weights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Public list is sorted by <code className="rounded bg-muted px-1">isPremium DESC</code> →{" "}
            <code className="rounded bg-muted px-1">premiumPosition DESC</code> →{" "}
            <code className="rounded bg-muted px-1">memberCount DESC</code>.
          </p>
          <p>
            Rank movement arrows come from <code>rank</code> vs <code>previousRank</code> fields, updated by the
            <code className="mx-1">update-stats</code> cron. Tuning weights will land with the ranking-engine
            milestone.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function TrendCard({
  title,
  data,
  field,
}: {
  title: string;
  data: { id: number; title: string; username: string; memberCount: number; rank: number | null; previousRank: number | null; dailyGrowth: number; weeklyGrowth: number; monthlyGrowth: number }[];
  field: "dailyGrowth" | "weeklyGrowth" | "monthlyGrowth";
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead className="text-right">Δ</TableHead>
              <TableHead className="text-right">Members</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((c, i) => (
              <TableRow key={c.id}>
                <TableCell className="text-muted-foreground">
                  <RankIndicator current={i + 1} previous={c.previousRank} />
                </TableCell>
                <TableCell className="font-medium">
                  <div className="truncate">{c.title}</div>
                  <div className="text-xs text-muted-foreground">@{c.username}</div>
                </TableCell>
                <TableCell className="text-right text-xs tabular-nums text-emerald-600 dark:text-emerald-400">
                  +{formatMemberCount(c[field])}
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatMemberCount(c.memberCount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

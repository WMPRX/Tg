import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, BadgeCheck, ExternalLink, Users, Hash, TrendingUp, Clock, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChannelAvatar } from "@/components/channels/channel-avatar";
import { ChannelTable } from "@/components/channels/channel-table";
import { GrowthChart } from "@/components/charts/growth-chart";
import { LanguageFlag } from "@/components/channels/language-flag";
import { formatMemberCount, localize, cn } from "@/lib/utils";

export const revalidate = 300;

export default async function ChannelDetailPage({
  params,
}: {
  params: { locale: string; username: string };
}) {
  const { locale, username } = params;
  const t = await getTranslations({ locale, namespace: "channel" });

  const channel = await prisma.channel.findUnique({
    where: { username },
    include: {
      category: true,
      statistics: { orderBy: { date: "asc" }, take: 30 },
      tags: { include: { tag: true } },
    },
  });
  if (!channel || !channel.isActive) notFound();

  const similar = channel.categoryId
    ? await prisma.channel.findMany({
        where: {
          categoryId: channel.categoryId,
          id: { not: channel.id },
          isActive: true,
        },
        include: { category: true },
        orderBy: { memberCount: "desc" },
        take: 8,
      })
    : [];

  const growthData = channel.statistics.map((s) => ({
    date: new Date(s.date).toLocaleDateString(locale, { month: "short", day: "numeric" }),
    members: s.memberCount,
  }));

  const lastUpdate = channel.statistics.length
    ? new Date(channel.statistics[channel.statistics.length - 1].date)
    : null;

  const typeLabel =
    channel.type === "GROUP"
      ? t("group")
      : channel.type === "SUPERGROUP"
        ? t("supergroup")
        : t("channel");

  return (
    <div className="container py-6">
      <Link
        href="/channels"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("back")}
      </Link>

      <div
        className={cn(
          "rounded-2xl border p-5 md:p-6",
          channel.isPremium
            ? "border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-100 dark:border-amber-700/50 dark:from-amber-950/40 dark:to-yellow-950/40"
            : "bg-card",
        )}
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <ChannelAvatar
            src={channel.avatarUrl}
            name={channel.title}
            size={96}
            showStar={channel.isPremium}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold md:text-3xl">{channel.title}</h1>
              {channel.isVerified && <BadgeCheck className="h-6 w-6 fill-sky-500 text-white" />}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">@{channel.username}</div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <Badge variant="outline">{typeLabel}</Badge>
              {channel.isPremium && (
                <Badge variant="premium" className="gap-1">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  {t("premium")}
                </Badge>
              )}
              {channel.isVerified && (
                <Badge variant="outline" className="gap-1">
                  <BadgeCheck className="h-3 w-3 fill-sky-500 text-white" /> {t("verified")}
                </Badge>
              )}
              <Badge variant="outline">
                <LanguageFlag code={channel.language} />
              </Badge>
              {channel.category && (
                <Badge variant="outline">{localize(channel.category.name, locale)}</Badge>
              )}
            </div>

            {channel.description && (
              <p className="mt-3 max-w-2xl whitespace-pre-line text-sm text-muted-foreground">
                {channel.description}
              </p>
            )}

            <div className="mt-4">
              <a
                href={channel.inviteLink ?? `https://t.me/${channel.username}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  {t("openInTelegram")}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon={<Users className="h-4 w-4" />} label={t("members")} value={formatMemberCount(channel.memberCount)} />
        <Stat icon={<Hash className="h-4 w-4" />} label={t("currentRank")} value={channel.rank ? `#${channel.rank}` : "—"} />
        <Stat
          icon={<TrendingUp className="h-4 w-4" />}
          label={t("growth")}
          value={channel.dailyGrowth ? (channel.dailyGrowth > 0 ? `+${channel.dailyGrowth}` : String(channel.dailyGrowth)) : "—"}
        />
        <Stat
          icon={<Clock className="h-4 w-4" />}
          label={t("lastUpdate")}
          value={lastUpdate ? lastUpdate.toLocaleDateString(locale) : "—"}
        />
      </div>

      <section className="mt-6 rounded-xl border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold">{t("growthTitle")}</h2>
        {growthData.length > 1 ? (
          <GrowthChart data={growthData} />
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">{t("noHistory")}</p>
        )}
      </section>

      {similar.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">{t("similar")}</h2>
          <ChannelTable
            channels={similar.map((c) => ({
              id: c.id,
              username: c.username,
              title: c.title,
              avatarUrl: c.avatarUrl,
              memberCount: c.memberCount,
              language: c.language,
              isVerified: c.isVerified,
              isPremium: c.isPremium,
              rank: c.rank,
              previousRank: c.previousRank,
              category: c.category ? { slug: c.category.slug, name: c.category.name } : null,
            }))}
            locale={locale}
          />
        </section>
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-1 text-xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

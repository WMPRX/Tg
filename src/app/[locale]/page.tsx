import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/channels/hero";
import { LanguageTabs } from "@/components/channels/language-tabs";
import { ChannelTable } from "@/components/channels/channel-table";
import { SponsoredBanner } from "@/components/channels/sponsored-banner";

export const revalidate = 300; // 5 min ISR

export default async function HomePage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { lang?: string };
}) {
  const { locale } = params;
  const langFilter = searchParams.lang;
  const t = await getTranslations({ locale, namespace: "table" });

  const [channelCount, totalMembersAgg, languageGroups, channels] = await Promise.all([
    prisma.channel.count({ where: { isActive: true } }),
    prisma.channel.aggregate({ _sum: { memberCount: true }, where: { isActive: true } }),
    prisma.channel.groupBy({
      by: ["language"],
      where: { isActive: true },
      _count: { language: true },
      orderBy: { _count: { language: "desc" } },
    }),
    prisma.channel.findMany({
      where: {
        isActive: true,
        ...(langFilter ? { language: langFilter } : {}),
      },
      include: { category: true },
      orderBy: [
        { isPremium: "desc" },
        { premiumPosition: "desc" },
        { rank: "asc" },
        { memberCount: "desc" },
      ],
      take: 50,
    }),
  ]);

  const languageTabs = languageGroups.map((g) => ({ code: g.language, count: g._count.language }));
  const totalMembers = totalMembersAgg._sum.memberCount ?? 0;

  return (
    <div className="container py-6">
      <Hero
        channelCount={channelCount}
        memberCount={totalMembers}
        languageCount={languageTabs.length}
      />
      <div className="mt-6">
        <LanguageTabs items={languageTabs} active={langFilter ?? "all"} />
      </div>
      <div className="mt-5">
        <SponsoredBanner />
      </div>
      <div className="mt-5">
        <ChannelTable
          channels={channels.map((c) => ({
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
            category: c.category
              ? { slug: c.category.slug, name: c.category.name }
              : null,
          }))}
          locale={locale}
        />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t("showing", { total: channelCount, shown: channels.length })}
        </p>
      </div>
    </div>
  );
}

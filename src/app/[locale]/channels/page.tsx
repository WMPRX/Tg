import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { LanguageTabs } from "@/components/channels/language-tabs";
import { ChannelTable } from "@/components/channels/channel-table";
import { SponsoredBanner } from "@/components/channels/sponsored-banner";

export const revalidate = 300;

const PAGE_SIZE = 50;

export default async function ChannelsPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { lang?: string; page?: string };
}) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "table" });
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const langFilter = searchParams.lang;

  const where = {
    isActive: true,
    ...(langFilter ? { language: langFilter } : {}),
  };

  const [total, languageGroups, channels] = await Promise.all([
    prisma.channel.count({ where }),
    prisma.channel.groupBy({
      by: ["language"],
      where: { isActive: true },
      _count: { language: true },
      orderBy: { _count: { language: "desc" } },
    }),
    prisma.channel.findMany({
      where,
      include: { category: true },
      orderBy: [
        { isPremium: "desc" },
        { premiumPosition: "desc" },
        { rank: "asc" },
        { memberCount: "desc" },
      ],
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
  ]);

  const languageTabs = languageGroups.map((g) => ({ code: g.language, count: g._count.language }));

  return (
    <div className="container py-6">
      <LanguageTabs items={languageTabs} active={langFilter ?? "all"} />
      <div className="mt-5">
        <SponsoredBanner />
      </div>
      <div className="mt-5">
        <ChannelTable
          offset={(page - 1) * PAGE_SIZE}
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
            category: c.category ? { slug: c.category.slug, name: c.category.name } : null,
          }))}
          locale={locale}
        />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t("showing", { total, shown: channels.length })}
        </p>
      </div>
    </div>
  );
}

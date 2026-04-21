import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { ChannelTable } from "@/components/channels/channel-table";
import { localize } from "@/lib/utils";

export const revalidate = 300;

export default async function CategoryDetailPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const { locale, slug } = params;
  const t = await getTranslations({ locale, namespace: "table" });
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category || !category.isActive) notFound();
  const channels = await prisma.channel.findMany({
    where: { categoryId: category.id, isActive: true },
    include: { category: true },
    orderBy: [
      { isPremium: "desc" },
      { premiumPosition: "desc" },
      { memberCount: "desc" },
    ],
    take: 100,
  });
  const total = await prisma.channel.count({ where: { categoryId: category.id, isActive: true } });

  return (
    <div className="container py-6">
      <h1 className="mb-4 text-2xl font-bold md:text-3xl">{localize(category.name, locale)}</h1>
      {category.description && (
        <p className="mb-5 max-w-2xl text-sm text-muted-foreground">
          {localize(category.description, locale)}
        </p>
      )}
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
          category: c.category ? { slug: c.category.slug, name: c.category.name } : null,
        }))}
        locale={locale}
      />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        {t("showing", { total, shown: channels.length })}
      </p>
    </div>
  );
}

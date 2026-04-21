import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { ChannelTable } from "@/components/channels/channel-table";
import { SearchForm } from "./search-form";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { q?: string };
}) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "search" });
  const q = (searchParams.q ?? "").trim();

  const channels = q
    ? await prisma.channel.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: q } },
            { username: { contains: q } },
            { description: { contains: q } },
          ],
        },
        include: { category: true },
        orderBy: [{ isPremium: "desc" }, { memberCount: "desc" }],
        take: 50,
      })
    : [];

  return (
    <div className="container py-8">
      <h1 className="mb-4 text-2xl font-bold md:text-3xl">{t("title")}</h1>
      <SearchForm initialQuery={q} placeholder={t("placeholder")} />
      <div className="mt-6">
        {q && channels.length === 0 ? (
          <p className="rounded-lg border p-8 text-center text-sm text-muted-foreground">{t("noResults")}</p>
        ) : (
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
        )}
      </div>
    </div>
  );
}

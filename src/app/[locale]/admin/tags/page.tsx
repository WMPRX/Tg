import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { TagsManager } from "@/components/admin/tags-manager";

export const dynamic = "force-dynamic";

export default async function AdminTagsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { channels: true } } },
  });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("tags")}</h1>
      <TagsManager
        items={tags.map((t) => ({ id: t.id, name: t.name, slug: t.slug, count: t._count.channels }))}
      />
    </div>
  );
}

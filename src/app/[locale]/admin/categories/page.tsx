import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { CategoriesManager } from "@/components/admin/categories-manager";
import { localize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("categories")}</h1>
      <CategoriesManager
        items={categories.map((c) => ({
          id: c.id,
          slug: c.slug,
          name: localize(c.name, locale),
          rawName: c.name,
          icon: c.icon ?? "",
          order: c.order,
          isActive: c.isActive,
          channelCount: c.channelCount,
        }))}
      />
    </div>
  );
}

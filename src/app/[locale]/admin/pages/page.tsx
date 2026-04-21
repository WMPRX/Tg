import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PagesManager } from "@/components/admin/pages-manager";
import { localize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const pages = await prisma.page.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("pages")}</h1>
      <PagesManager
        items={pages.map((p) => ({
          id: p.id,
          slug: p.slug,
          title: localize(p.title, locale),
          isPublished: p.isPublished,
        }))}
      />
    </div>
  );
}

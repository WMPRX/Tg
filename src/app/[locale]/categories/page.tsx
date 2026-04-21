import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/routing";
import { Card } from "@/components/ui/card";
import { localize } from "@/lib/utils";

export const revalidate = 300;

export default async function CategoriesPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "categories" });
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });
  return (
    <div className="container py-10">
      <h1 className="mb-6 text-2xl font-bold md:text-3xl">{t("title")}</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/categories/${cat.slug}`}>
            <Card className="flex h-full flex-col items-start gap-2 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
              {cat.icon && <span className="text-2xl">{cat.icon}</span>}
              <div className="font-semibold">{localize(cat.name, locale)}</div>
              <div className="text-xs text-muted-foreground">
                {t("channelCount", { count: cat.channelCount })}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

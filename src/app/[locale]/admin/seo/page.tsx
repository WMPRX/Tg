import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { SeoSettingsForm } from "@/components/admin/seo-settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSeoPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const settings =
    (await prisma.siteSettings.findUnique({ where: { id: 1 } })) ??
    (await prisma.siteSettings.create({ data: { id: 1 } }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("seo")}</h1>
      <SeoSettingsForm
        defaults={{
          metaKeywords: settings.metaKeywords,
          metaDescription: settings.metaDescription,
          siteDescription: settings.siteDescription,
          socialLinks: settings.socialLinks,
        }}
      />
    </div>
  );
}

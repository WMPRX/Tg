import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "admin" });

  const settings =
    (await prisma.siteSettings.findUnique({ where: { id: 1 } })) ??
    (await prisma.siteSettings.create({ data: { id: 1 } }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("settings")}</h1>
      <SiteSettingsForm
        defaults={{
          siteName: settings.siteName,
          defaultLanguage: settings.defaultLanguage,
          maintenanceMode: settings.maintenanceMode,
          adsEnabled: settings.adsEnabled,
          maxChannelsPerUser: settings.maxChannelsPerUser,
          autoApproveMinMembers: settings.autoApproveMinMembers,
          analyticsId: settings.analyticsId ?? "",
          bankTransferInfo: settings.bankTransferInfo ?? "",
          bannedWords: settings.bannedWords,
        }}
      />
    </div>
  );
}

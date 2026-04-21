import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/dashboard/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "nav" });
  const user = (await getCurrentUser())!;
  const fresh = await prisma.user.findUnique({
    where: { id: Number(user.id) },
    select: { id: true, name: true, email: true, username: true, telegramUsername: true, bio: true },
  });
  if (!fresh) return null;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("settings")}</h1>
      <SettingsForm
        defaults={{
          name: fresh.name,
          email: fresh.email,
          username: fresh.username,
          telegramUsername: fresh.telegramUsername ?? "",
          bio: fresh.bio ?? "",
        }}
      />
    </div>
  );
}

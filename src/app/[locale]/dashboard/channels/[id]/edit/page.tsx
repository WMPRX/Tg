import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import { EditChannelForm } from "@/components/dashboard/edit-channel-form";
import { LOCALES } from "@/lib/constants";
import { localize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditChannelPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const { locale, id } = params;
  const channelId = Number(id);
  if (!channelId) notFound();

  const user = (await getCurrentUser())!;
  const channel = await prisma.channel.findFirst({
    where: { id: channelId, submittedById: Number(user.id) },
  });
  if (!channel) notFound();

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
  const t = await getTranslations({ locale, namespace: "dashboard" });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("edit")}</h1>
      <EditChannelForm
        channel={{
          id: channel.id,
          username: channel.username,
          title: channel.title,
          description: channel.description ?? "",
          type: channel.type,
          language: channel.language,
          categoryId: channel.categoryId,
          inviteLink: channel.inviteLink ?? "",
          websiteUrl: channel.websiteUrl ?? "",
        }}
        categories={categories.map((c) => ({ id: c.id, name: localize(c.name, locale) }))}
        locales={LOCALES as unknown as string[]}
      />
    </div>
  );
}

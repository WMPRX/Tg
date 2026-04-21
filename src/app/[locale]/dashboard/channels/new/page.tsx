import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { AddChannelWizard } from "@/components/dashboard/add-channel-wizard";
import { localize } from "@/lib/utils";
import { LOCALES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function NewChannelPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
  const options = categories.map((c) => ({
    id: c.id,
    name: localize(c.name, locale),
  }));
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("addNewChannel")}</h1>
      <AddChannelWizard categories={options} locales={LOCALES as unknown as string[]} />
    </div>
  );
}

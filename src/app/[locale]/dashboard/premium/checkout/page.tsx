import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import { CheckoutForm } from "@/components/premium/checkout-form";
import { localize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { plan?: string };
}) {
  const { locale } = params;
  const slug = searchParams?.plan;
  if (!slug) notFound();
  const plan = await prisma.premiumPlan.findUnique({ where: { slug } });
  if (!plan || !plan.isActive) notFound();

  const user = (await getCurrentUser())!;
  const channels = await prisma.channel.findMany({
    where: { submittedById: Number(user.id) },
    select: { id: true, username: true, title: true },
    orderBy: { title: "asc" },
  });

  const tPrem = await getTranslations({ locale, namespace: "premium" });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{tPrem("heroTitle")}</h1>
      <CheckoutForm
        plan={{
          id: plan.id,
          slug: plan.slug,
          name: localize(plan.name, locale),
          price: plan.price,
          currency: plan.currency,
          durationDays: plan.durationDays,
        }}
        channels={channels}
      />
    </div>
  );
}

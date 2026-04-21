import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { SubmissionReviewList } from "@/components/admin/submission-review-list";

export const dynamic = "force-dynamic";

export default async function AdminSubmissionsPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { status?: string };
}) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const status = searchParams?.status ?? "PENDING";

  const submissions = await prisma.channelSubmission.findMany({
    where: { status },
    include: { user: { select: { id: true, name: true, email: true, username: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const categoryIds = submissions
    .map((s) => s.categoryId)
    .filter((id): id is number => id != null);
  const categories =
    categoryIds.length > 0
      ? await prisma.category.findMany({ where: { id: { in: categoryIds } } })
      : [];
  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("submissions")}</h1>
      <div className="flex items-center gap-2 text-sm">
        {["PENDING", "APPROVED", "REJECTED", "REVISION_REQUESTED"].map((s) => (
          <a
            key={s}
            href={`?status=${s}`}
            className={`rounded-full border px-3 py-1 transition-colors ${
              s === status ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}
          </a>
        ))}
      </div>
      <SubmissionReviewList
        submissions={submissions.map((s) => ({
          id: s.id,
          telegramUsername: s.telegramUsername,
          title: s.title ?? "",
          description: s.description ?? "",
          type: s.type,
          language: s.language,
          status: s.status,
          category: s.categoryId ? (catMap.get(s.categoryId) ?? null) : null,
          user: s.user,
          createdAt: s.createdAt.toISOString(),
        }))}
        locale={locale}
      />
    </div>
  );
}

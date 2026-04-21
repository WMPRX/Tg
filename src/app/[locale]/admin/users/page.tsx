import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import { UsersManager } from "@/components/admin/users-manager";
import { redirect } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { q?: string };
}) {
  const { locale } = params;
  const current = (await getCurrentUser())!;
  if (current.role !== "SUPER_ADMIN" && current.role !== "ADMIN") {
    redirect({ href: "/admin", locale });
  }
  const t = await getTranslations({ locale, namespace: "admin" });
  const q = searchParams?.q?.trim() ?? "";

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q } },
            { username: { contains: q } },
            { name: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      isBanned: true,
      isActive: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t("users")}</h1>
        <form method="get" className="flex items-center gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search users..."
            className="h-9 w-64 rounded-md border border-input bg-background px-3 text-sm"
          />
        </form>
      </div>
      <UsersManager users={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))} currentRole={current.role} />
    </div>
  );
}

import { redirect } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/rbac";
import { isStaff } from "@/lib/rbac";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect({ href: "/login", locale: params.locale });
  if (!isStaff(user!.role)) redirect({ href: "/dashboard", locale: params.locale });

  return (
    <div className="container py-8">
      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        <AdminSidebar role={user!.role} />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

import { redirect } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/rbac";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect({ href: "/login", locale: params.locale });

  return (
    <div className="container py-8">
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <DashboardSidebar />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

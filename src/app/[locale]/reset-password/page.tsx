import { getTranslations } from "next-intl/server";
import { ResetPasswordForm } from "./reset-password-form";
import { Link } from "@/i18n/routing";

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { token?: string };
}) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "auth" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const token = searchParams?.token ?? "";
  return (
    <div className="container max-w-md py-16">
      <h1 className="mb-6 text-2xl font-bold">{t("resetPasswordTitle")}</h1>
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <p className="text-sm text-destructive">{t("invalidToken")}</p>
      )}
      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">
          {tNav("login")}
        </Link>
      </p>
    </div>
  );
}

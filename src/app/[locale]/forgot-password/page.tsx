import { getTranslations } from "next-intl/server";
import { ForgotPasswordForm } from "./forgot-password-form";
import { Link } from "@/i18n/routing";

export default async function ForgotPasswordPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "auth" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  return (
    <div className="container max-w-md py-16">
      <h1 className="mb-6 text-2xl font-bold">{t("resetPasswordTitle")}</h1>
      <p className="mb-6 text-sm text-muted-foreground">{t("forgotPasswordHelp")}</p>
      <ForgotPasswordForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">
          {tNav("login")}
        </Link>
      </p>
    </div>
  );
}

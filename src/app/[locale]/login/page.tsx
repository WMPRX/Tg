import { getTranslations } from "next-intl/server";
import { LoginForm } from "./login-form";
import { Link } from "@/i18n/routing";

export default async function LoginPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "auth" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  return (
    <div className="container max-w-md py-16">
      <h1 className="mb-6 text-2xl font-bold">{t("loginTitle")}</h1>
      <LoginForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <Link href="/register" className="text-primary hover:underline">
          {tNav("register")}
        </Link>
      </p>
    </div>
  );
}

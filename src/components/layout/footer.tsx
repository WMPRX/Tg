import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Logo } from "@/components/layout/logo";
import { LOCALES } from "@/lib/constants";

export function Footer({ categoryCount = 16 }: { categoryCount?: number }) {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  const cols = [
    {
      title: t("discover"),
      links: [
        { href: "/channels", label: t("popularChannels") },
        { href: "/categories", label: t("categories") },
        { href: "/channels?sort=new", label: t("newChannels") },
      ],
    },
    {
      title: t("forOwners"),
      links: [
        { href: "/dashboard/channels/new", label: t("addChannel") },
        { href: "/premium", label: t("premium") },
        { href: "/premium", label: t("pricing") },
        { href: "/pages/help", label: t("helpCenter") },
      ],
    },
    {
      title: t("company"),
      links: [
        { href: "/pages/about", label: t("aboutUs") },
        { href: "/pages/privacy", label: t("privacy") },
        { href: "/pages/terms", label: t("terms") },
      ],
    },
  ] as const;

  return (
    <footer className="mt-16 border-t bg-muted/30 dark:bg-muted/10">
      <div className="container grid gap-8 py-10 md:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-sm text-sm text-muted-foreground">
            {t("about", { total: LOCALES.length, cats: categoryCount })}
          </p>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 text-sm font-semibold">{col.title}</h3>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="container flex flex-col items-start justify-between gap-1 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <span>{t("copyright", { year })}</span>
          <span>{t("disclaimer")}</span>
        </div>
      </div>
    </footer>
  );
}

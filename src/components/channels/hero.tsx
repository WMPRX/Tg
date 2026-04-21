"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatMemberCount } from "@/lib/utils";

export function Hero({
  channelCount,
  memberCount,
  languageCount,
}: {
  channelCount: number;
  memberCount: number;
  languageCount: number;
}) {
  const t = useTranslations("hero");
  const router = useRouter();
  const [q, setQ] = React.useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <section className="relative overflow-hidden border-b">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50 via-background to-white dark:from-sky-950/30 dark:via-background dark:to-background"
      />
      <div className="container relative py-10 md:py-14">
        <h1 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
          {t("titlePrefix")}
          <span className="text-primary">{t("titleAccent")}</span>
          {t("titleSuffix")}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">{t("subtitle")}</p>
        <form onSubmit={onSubmit} className="mt-5 flex max-w-xl gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-11 pl-9"
            />
          </div>
          <Button type="submit" size="lg">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <dl className="mt-8 grid max-w-xl grid-cols-3 gap-8">
          <Stat label={t("statChannels")} value={channelCount} />
          <Stat label={t("statMembers")} value={memberCount} format />
          <Stat label={t("statLanguages")} value={languageCount} />
        </dl>
      </div>
    </section>
  );
}

function Stat({ label, value, format = false }: { label: string; value: number; format?: boolean }) {
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    let current = 0;
    const duration = 900;
    const steps = 30;
    const step = value / steps;
    const interval = setInterval(() => {
      current += step;
      if (current >= value) {
        setDisplay(value);
        clearInterval(interval);
      } else {
        setDisplay(current);
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [value]);
  return (
    <div>
      <dd className="text-2xl font-bold tabular-nums md:text-3xl">
        {format ? formatMemberCount(Math.floor(display)) : Math.floor(display).toLocaleString()}
      </dd>
      <dt className="mt-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</dt>
    </div>
  );
}

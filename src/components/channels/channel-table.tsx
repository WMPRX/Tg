import { useTranslations } from "next-intl";
import { BadgeCheck, Star } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChannelAvatar } from "@/components/channels/channel-avatar";
import { RankIndicator } from "@/components/channels/rank-indicator";
import { LanguageFlag } from "@/components/channels/language-flag";
import { formatMemberCount, localize, cn } from "@/lib/utils";

export type ChannelRowData = {
  id: number;
  username: string;
  title: string;
  avatarUrl?: string | null;
  memberCount: number;
  language: string;
  isVerified: boolean;
  isPremium: boolean;
  rank?: number | null;
  previousRank?: number | null;
  category?: { slug: string; name: string } | null;
};

export function ChannelTable({
  channels,
  locale,
  offset = 0,
}: {
  channels: ChannelRowData[];
  locale: string;
  offset?: number;
}) {
  const t = useTranslations("table");
  const tc = useTranslations("channel");

  if (channels.length === 0) {
    return <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">{t("empty")}</div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 text-center">{t("number")}</TableHead>
            <TableHead>{t("channel")}</TableHead>
            <TableHead className="hidden md:table-cell">{t("category")}</TableHead>
            <TableHead className="text-right">{t("members")}</TableHead>
            <TableHead className="w-24 text-right">{t("language")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {channels.map((ch, i) => {
            const rank = offset + i + 1;
            const categoryName = ch.category ? localize(ch.category.name, locale) : "";
            return (
              <TableRow key={ch.id} className={cn(ch.isPremium && "premium-row")}>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center">
                    <span className={cn("text-sm font-medium tabular-nums", ch.isPremium && "text-amber-700 dark:text-amber-300")}>
                      {rank}
                    </span>
                    <RankIndicator current={ch.rank} previous={ch.previousRank} />
                  </div>
                </TableCell>
                <TableCell>
                  <Link href={`/channels/${ch.username}`} className="flex items-center gap-3 group">
                    <ChannelAvatar
                      src={ch.avatarUrl}
                      name={ch.title}
                      size={36}
                      showStar={ch.isPremium}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-semibold group-hover:text-primary">{ch.title}</span>
                        {ch.isVerified && <BadgeCheck className="h-4 w-4 shrink-0 fill-sky-500 text-white" />}
                        {ch.isPremium && (
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" aria-label={tc("premium")} />
                        )}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        @{ch.username}
                        {categoryName && <span className="mx-1">·</span>}
                        {categoryName}
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                  {categoryName || "—"}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatMemberCount(ch.memberCount)}
                </TableCell>
                <TableCell className="text-right">
                  <LanguageFlag code={ch.language} className="justify-end" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

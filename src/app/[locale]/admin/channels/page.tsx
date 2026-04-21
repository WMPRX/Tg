import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChannelAvatar } from "@/components/channels/channel-avatar";
import { Badge } from "@/components/ui/badge";
import { formatMemberCount, localize } from "@/lib/utils";
import { Link } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export default async function AdminChannelsPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { q?: string };
}) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "admin" });
  const tTable = await getTranslations({ locale, namespace: "table" });

  const q = searchParams?.q?.trim() ?? "";
  const channels = await prisma.channel.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q } },
            { username: { contains: q } },
          ],
        }
      : undefined,
    include: { category: true },
    orderBy: [{ isPremium: "desc" }, { memberCount: "desc" }],
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t("channels")}</h1>
        <form method="get" className="flex items-center gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search channels..."
            className="h-9 w-64 rounded-md border border-input bg-background px-3 text-sm"
          />
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>{tTable("channel")}</TableHead>
              <TableHead>{tTable("category")}</TableHead>
              <TableHead>{tTable("language")}</TableHead>
              <TableHead className="text-right">{tTable("members")}</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {channels.map((c, i) => (
              <TableRow key={c.id} className={c.isPremium ? "premium-row" : undefined}>
                <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <ChannelAvatar name={c.title} src={c.avatarUrl} size={32} showStar={c.isPremium} />
                    <div className="min-w-0">
                      <div className="truncate font-medium">{c.title}</div>
                      <div className="text-xs text-muted-foreground">@{c.username}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {c.category ? localize(c.category.name, locale) : "—"}
                </TableCell>
                <TableCell className="uppercase text-muted-foreground">{c.language}</TableCell>
                <TableCell className="text-right tabular-nums">{formatMemberCount(c.memberCount)}</TableCell>
                <TableCell>
                  {c.isPremium ? (
                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300">Premium</Badge>
                  ) : c.isActive ? (
                    <Badge variant="secondary">Active</Badge>
                  ) : (
                    <Badge variant="outline">Hidden</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/channels/${c.username}`}
                    className="text-xs text-primary hover:underline"
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

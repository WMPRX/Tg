import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMemberCount, localize } from "@/lib/utils";
import { ChannelAvatar } from "@/components/channels/channel-avatar";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function DashboardChannelsPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tTable = await getTranslations({ locale, namespace: "table" });

  const user = (await getCurrentUser())!;

  const [channels, submissions] = await Promise.all([
    prisma.channel.findMany({
      where: { submittedById: Number(user.id) },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.channelSubmission.findMany({
      where: { userId: Number(user.id) },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t("myChannelsTitle")}</h1>
        <Button asChild>
          <Link href="/dashboard/channels/new">{tNav("addChannel")}</Link>
        </Button>
      </div>

      {channels.length === 0 && submissions.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          <p>{t("noChannels")}</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/channels/new">{t("addNewChannel")}</Link>
          </Button>
        </div>
      ) : (
        <>
          {channels.length > 0 && (
            <div className="overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tTable("channel")}</TableHead>
                    <TableHead>{tTable("category")}</TableHead>
                    <TableHead className="text-right">{tTable("members")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead className="w-24 text-right" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {channels.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <ChannelAvatar name={c.title} src={c.avatarUrl} size={32} />
                          <div className="min-w-0">
                            <div className="truncate font-medium">{c.title}</div>
                            <div className="text-xs text-muted-foreground">@{c.username}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.category ? localize(c.category.name, locale) : "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMemberCount(c.memberCount)}
                      </TableCell>
                      <TableCell>
                        {c.isPremium ? (
                          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300">
                            Premium
                          </Badge>
                        ) : c.isActive ? (
                          <Badge variant="secondary">{t("status_APPROVED")}</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/channels/${c.id}/edit`}>{t("edit")}</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {submissions.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold">{tNav("addChannel")}</h2>
              <div className="overflow-hidden rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{tTable("channel")}</TableHead>
                      <TableHead>{tTable("language")}</TableHead>
                      <TableHead>{t("status")}</TableHead>
                      <TableHead className="w-24 text-right" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">
                          <div>{s.title ?? "—"}</div>
                          <div className="text-xs text-muted-foreground">@{s.telegramUsername}</div>
                        </TableCell>
                        <TableCell className="uppercase text-muted-foreground">{s.language}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{t(`status_${s.status}`)}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {s.createdAt.toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

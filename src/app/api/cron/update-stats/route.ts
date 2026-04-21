import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertCronSecret } from "@/lib/cron";
import { getChatInfo } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const deny = assertCronSecret(req);
  if (deny) return deny;

  const channels = await prisma.channel.findMany({
    where: { isActive: true },
    orderBy: { memberCount: "desc" },
    take: 200,
  });

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  let updated = 0;
  for (const channel of channels) {
    const info = await getChatInfo(channel.username);
    if (!info.ok || info.memberCount === undefined) continue;

    await prisma.channelStatistic.create({
      data: {
        channelId: channel.id,
        memberCount: info.memberCount,
        date: today,
      },
    });

    const [weekStat, monthStat] = await Promise.all([
      prisma.channelStatistic.findFirst({
        where: { channelId: channel.id, date: { lte: weekAgo } },
        orderBy: { date: "desc" },
      }),
      prisma.channelStatistic.findFirst({
        where: { channelId: channel.id, date: { lte: monthAgo } },
        orderBy: { date: "desc" },
      }),
    ]);

    const daily = info.memberCount - channel.memberCount;
    const weekly = weekStat ? info.memberCount - weekStat.memberCount : daily;
    const monthly = monthStat ? info.memberCount - monthStat.memberCount : weekly;

    await prisma.channel.update({
      where: { id: channel.id },
      data: {
        memberCount: info.memberCount,
        dailyGrowth: daily,
        weeklyGrowth: weekly,
        monthlyGrowth: monthly,
      },
    });
    updated++;
  }

  await recomputeRanks();

  return NextResponse.json({ ok: true, updated, total: channels.length });
}

async function recomputeRanks() {
  const channels = await prisma.channel.findMany({
    where: { isActive: true },
    orderBy: [{ isPremium: "desc" }, { premiumPosition: "desc" }, { memberCount: "desc" }],
    select: { id: true, rank: true },
  });
  for (let i = 0; i < channels.length; i++) {
    const c = channels[i];
    const nextRank = i + 1;
    if (c.rank !== nextRank) {
      await prisma.channel.update({
        where: { id: c.id },
        data: { previousRank: c.rank, rank: nextRank },
      });
    }
  }
}

export async function GET(req: Request) {
  return POST(req);
}

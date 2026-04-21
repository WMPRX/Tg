import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertCronSecret } from "@/lib/cron";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const deny = assertCronSecret(req);
  if (deny) return deny;

  const now = new Date();

  const expiredOrders = await prisma.premiumOrder.findMany({
    where: { status: "ACTIVE", endDate: { lte: now } },
    include: { channel: true },
  });

  let expired = 0;
  for (const order of expiredOrders) {
    await prisma.premiumOrder.update({
      where: { id: order.id },
      data: { status: "EXPIRED" },
    });
    await prisma.channel.update({
      where: { id: order.channelId },
      data: {
        isPremium: false,
        premiumPlanId: null,
        premiumUntil: null,
        premiumPosition: 0,
        hasBadge: false,
      },
    });
    expired++;
  }

  return NextResponse.json({ ok: true, expired });
}

export async function GET(req: Request) {
  return POST(req);
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertCronSecret } from "@/lib/cron";
import { sendEmail, premiumExpiringEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const deny = assertCronSecret(req);
  if (deny) return deny;

  const now = new Date();
  const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const orders = await prisma.premiumOrder.findMany({
    where: {
      status: "ACTIVE",
      endDate: { gt: now, lte: soon },
    },
    include: { user: true, channel: true, plan: true },
  });

  let sent = 0;
  for (const order of orders) {
    if (!order.endDate) continue;
    const daysLeft = Math.ceil((order.endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    await sendEmail({
      to: order.user.email,
      subject: `Your premium for @${order.channel.username} expires in ${daysLeft} day(s)`,
      html: premiumExpiringEmail({
        userName: order.user.name,
        channelUsername: order.channel.username,
        endDate: order.endDate,
        daysLeft,
      }),
    });
    sent++;
  }

  return NextResponse.json({ ok: true, sent, total: orders.length });
}

export async function GET(req: Request) {
  return POST(req);
}

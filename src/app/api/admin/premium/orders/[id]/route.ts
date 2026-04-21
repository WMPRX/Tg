import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isStaff } from "@/lib/rbac";
import { ORDER_STATUSES } from "@/lib/constants";
import { localize } from "@/lib/utils";
import {
  sendEmail,
  premiumActivatedEmail,
  paymentReceiptEmail,
} from "@/lib/email";

const schema = z.object({
  status: z.enum(ORDER_STATUSES as unknown as [string, ...string[]]),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const actor = await getCurrentUser();
  if (!actor || !isStaff(actor.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "BadRequest" }, { status: 400 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "ValidationError" }, { status: 400 });

  const order = await prisma.premiumOrder.findUnique({
    where: { id },
    include: { plan: true, user: true, channel: true },
  });
  if (!order) return NextResponse.json({ error: "NotFound" }, { status: 404 });

  const updates: Parameters<typeof prisma.premiumOrder.update>[0]["data"] = {
    status: parsed.data.status,
  };

  if (parsed.data.status === "ACTIVE" && !order.startDate) {
    const start = new Date();
    const end = new Date(start.getTime() + order.plan.durationDays * 24 * 60 * 60 * 1000);
    updates.startDate = start;
    updates.endDate = end;
    await prisma.channel.update({
      where: { id: order.channelId },
      data: {
        isPremium: true,
        premiumUntil: end,
        premiumPlanId: order.planId,
        premiumPosition: 100,
        hasBadge: true,
      },
    });
    const planName = localize(order.plan.name, "en");
    await sendEmail({
      to: order.user.email,
      subject: `Premium activated for @${order.channel.username}`,
      html: premiumActivatedEmail({
        userName: order.user.name,
        channelUsername: order.channel.username,
        planName,
        endDate: end,
      }),
    });
    await sendEmail({
      to: order.user.email,
      subject: `Receipt — ${order.orderNumber}`,
      html: paymentReceiptEmail({
        userName: order.user.name,
        orderNumber: order.orderNumber,
        amount: order.amount,
        currency: order.currency,
        planName,
      }),
    });
  }
  if (parsed.data.status === "EXPIRED" || parsed.data.status === "CANCELLED" || parsed.data.status === "REFUNDED") {
    await prisma.channel.update({
      where: { id: order.channelId },
      data: {
        isPremium: false,
        premiumUntil: null,
        premiumPlanId: null,
        premiumPosition: null,
        hasBadge: false,
      },
    });
  }

  const updated = await prisma.premiumOrder.update({ where: { id }, data: updates });
  return NextResponse.json({ ok: true, order: updated });
}

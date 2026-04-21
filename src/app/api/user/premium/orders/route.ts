import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import { PAYMENT_METHODS } from "@/lib/constants";
import { generateOrderNumber } from "@/lib/utils";

const schema = z.object({
  planId: z.number().int().positive(),
  channelId: z.number().int().positive(),
  paymentMethod: z.enum(PAYMENT_METHODS as unknown as [string, ...string[]]),
  couponCode: z.string().trim().max(40).optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "ValidationError", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const [plan, channel] = await Promise.all([
    prisma.premiumPlan.findUnique({ where: { id: data.planId } }),
    prisma.channel.findFirst({
      where: { id: data.channelId, submittedById: Number(user.id) },
    }),
  ]);
  if (!plan || !plan.isActive) return NextResponse.json({ error: "planNotFound" }, { status: 404 });
  if (!channel) return NextResponse.json({ error: "channelNotFound" }, { status: 404 });

  let amount = plan.price;
  let discountAmount = 0;
  let couponCode: string | null = null;
  if (data.couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: data.couponCode } });
    if (
      coupon &&
      coupon.isActive &&
      (!coupon.validUntil || coupon.validUntil > new Date()) &&
      (coupon.usageLimit === null || coupon.usageCount < coupon.usageLimit)
    ) {
      if (coupon.discountType === "PERCENT") {
        discountAmount = plan.price * (coupon.discountValue / 100);
      } else {
        discountAmount = Math.min(plan.price, coupon.discountValue);
      }
      amount = Math.max(0, plan.price - discountAmount);
      couponCode = coupon.code;
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { usageCount: { increment: 1 } },
      });
    }
  }

  const order = await prisma.premiumOrder.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: Number(user.id),
      channelId: channel.id,
      planId: plan.id,
      amount,
      currency: plan.currency,
      paymentMethod: data.paymentMethod,
      status: "PENDING_PAYMENT",
      couponCode,
      discountAmount,
    },
    select: { id: true, orderNumber: true, status: true, amount: true, currency: true },
  });

  return NextResponse.json({ ok: true, ...order }, { status: 201 });
}

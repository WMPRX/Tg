import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Coinbase Commerce webhook. Verifies HMAC SHA-256 with the shared secret
 * when COINBASE_WEBHOOK_SECRET is set. Full event coverage is still a TODO.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-cc-webhook-signature") ?? "";
  const secret = process.env.COINBASE_WEBHOOK_SECRET;

  if (secret) {
    const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
    if (signature !== expected) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let event: {
    event?: { type?: string; data?: { metadata?: { orderId?: string } } };
  } = {};
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = event.event?.type;
  const orderId = Number(event.event?.data?.metadata?.orderId);

  if (type === "charge:confirmed" && Number.isFinite(orderId)) {
    await prisma.premiumOrder.updateMany({
      where: { id: orderId, status: "PENDING_PAYMENT" },
      data: { status: "PAID" },
    });
  }

  return NextResponse.json({ received: true });
}

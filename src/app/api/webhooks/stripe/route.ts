import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Stripe webhook skeleton. Full integration is a follow-up task:
 *   - Verify signature via `stripe.webhooks.constructEvent(body, sig, secret)`
 *   - Handle `checkout.session.completed`, `invoice.paid`, `charge.refunded`
 *   - Map session.metadata.orderId → PremiumOrder and mark ACTIVE
 * For now we accept the request and record a log so dev can observe traffic.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  const raw = await req.text();

  if (!secret) {
    console.warn("[stripe webhook] STRIPE_WEBHOOK_SECRET not set — ignoring");
    return NextResponse.json({ received: true, verified: false });
  }
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // TODO: verify signature with stripe SDK in production
  let event: { type?: string; data?: { object?: { metadata?: { orderId?: string } } } } = {};
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const orderId = Number(event.data?.object?.metadata?.orderId);
    if (Number.isFinite(orderId)) {
      await prisma.premiumOrder.updateMany({
        where: { id: orderId, status: "PENDING_PAYMENT" },
        data: { status: "PAID" },
      });
    }
  }

  return NextResponse.json({ received: true });
}

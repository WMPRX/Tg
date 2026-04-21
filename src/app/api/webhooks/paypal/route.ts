import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * PayPal webhook skeleton. Production hardening TODO:
 *   - Call PayPal `/v1/notifications/verify-webhook-signature` to verify
 *   - Handle `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`, refund events
 *   - Map custom_id → PremiumOrder.id
 */
export async function POST(req: Request) {
  const raw = await req.text();
  let event: {
    event_type?: string;
    resource?: { custom_id?: string; purchase_units?: Array<{ custom_id?: string }> };
  } = {};
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const customId =
    event.resource?.custom_id ?? event.resource?.purchase_units?.[0]?.custom_id;
  const orderId = Number(customId);

  if (event.event_type === "PAYMENT.CAPTURE.COMPLETED" && Number.isFinite(orderId)) {
    await prisma.premiumOrder.updateMany({
      where: { id: orderId, status: "PENDING_PAYMENT" },
      data: { status: "PAID" },
    });
  }

  return NextResponse.json({ received: true });
}

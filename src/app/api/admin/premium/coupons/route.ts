import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isStaff } from "@/lib/rbac";

const schema = z.object({
  code: z.string().trim().min(3).max(40).regex(/^[A-Z0-9_-]+$/),
  discountType: z.enum(["PERCENT", "FIXED"]),
  discountValue: z.number().min(0),
  usageLimit: z.number().int().positive().nullable().optional(),
  validUntil: z.string().datetime().nullable().optional(),
  planSlugs: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !isStaff(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "ValidationError" }, { status: 400 });
  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: parsed.data.code,
        discountType: parsed.data.discountType,
        discountValue: parsed.data.discountValue,
        usageLimit: parsed.data.usageLimit ?? null,
        validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : null,
        planSlugs: parsed.data.planSlugs?.length ? parsed.data.planSlugs.join(",") : null,
      },
    });
    return NextResponse.json({ ok: true, coupon }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "codeTaken" }, { status: 409 });
  }
}

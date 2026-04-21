import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isStaff } from "@/lib/rbac";

const schema = z.object({
  isActive: z.boolean().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !isStaff(user.role)) {
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
  const coupon = await prisma.coupon.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true, coupon });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !isStaff(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "BadRequest" }, { status: 400 });
  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

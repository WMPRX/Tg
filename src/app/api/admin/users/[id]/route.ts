import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import { USER_ROLES } from "@/lib/constants";

const schema = z.object({
  role: z.enum(USER_ROLES as unknown as [string, ...string[]]).optional(),
  isBanned: z.boolean().optional(),
  banReason: z.string().max(500).nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const actor = await getCurrentUser();
  if (!actor || (actor.role !== "SUPER_ADMIN" && actor.role !== "ADMIN")) {
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

  if (parsed.data.role && actor.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "onlySuperAdminCanSetRole" }, { status: 403 });
  }
  if (Number(actor.id) === id && parsed.data.isBanned) {
    return NextResponse.json({ error: "cannotSelfBan" }, { status: 400 });
  }

  const user = await prisma.user.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ ok: true, user });
}

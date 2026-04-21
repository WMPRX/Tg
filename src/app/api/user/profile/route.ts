import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";

const schema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  telegramUsername: z.string().trim().max(32).nullable().optional(),
  bio: z.string().trim().max(500).nullable().optional(),
});

export async function PATCH(req: Request) {
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

  const updated = await prisma.user.update({
    where: { id: Number(user.id) },
    data: parsed.data,
    select: { id: true, name: true, telegramUsername: true, bio: true },
  });
  return NextResponse.json({ ok: true, user: updated });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import { CHANNEL_TYPES, LOCALES } from "@/lib/constants";

const updateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  type: z.enum(CHANNEL_TYPES as unknown as [string, ...string[]]).optional(),
  language: z.enum(LOCALES as unknown as [string, ...string[]]).optional(),
  categoryId: z.number().int().positive().nullable().optional(),
  inviteLink: z.string().url().nullable().optional(),
  websiteUrl: z.string().url().nullable().optional(),
});

async function getOwnedChannel(id: number, userId: number) {
  return prisma.channel.findFirst({ where: { id, submittedById: userId } });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "BadRequest" }, { status: 400 });
  const channel = await getOwnedChannel(id, Number(user.id));
  if (!channel) return NextResponse.json({ error: "NotFound" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "ValidationError", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updated = await prisma.channel.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json({ ok: true, channel: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "BadRequest" }, { status: 400 });
  const channel = await getOwnedChannel(id, Number(user.id));
  if (!channel) return NextResponse.json({ error: "NotFound" }, { status: 404 });

  await prisma.channel.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

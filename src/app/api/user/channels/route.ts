import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import { CHANNEL_TYPES, LOCALES } from "@/lib/constants";

const schema = z.object({
  telegramUsername: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_]+$/),
  title: z.string().trim().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  language: z.enum(LOCALES as unknown as [string, ...string[]]),
  type: z.enum(CHANNEL_TYPES as unknown as [string, ...string[]]),
  categoryId: z.number().int().positive().optional().nullable(),
  inviteLink: z.string().url().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable(),
  tags: z.array(z.string().trim().max(40)).max(10).optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const channels = await prisma.channel.findMany({
    where: { submittedById: Number(user.id) },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ channels });
}

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

  const existing = await prisma.channel.findUnique({ where: { username: data.telegramUsername } });
  if (existing) {
    return NextResponse.json({ error: "alreadyListed" }, { status: 409 });
  }
  const existingSubmission = await prisma.channelSubmission.findFirst({
    where: { telegramUsername: data.telegramUsername, status: "PENDING" },
  });
  if (existingSubmission) {
    return NextResponse.json({ error: "submissionPending" }, { status: 409 });
  }

  const submission = await prisma.channelSubmission.create({
    data: {
      userId: Number(user.id),
      telegramUsername: data.telegramUsername,
      title: data.title,
      description: data.description ?? null,
      type: data.type,
      language: data.language,
      categoryId: data.categoryId ?? null,
      inviteLink: data.inviteLink ?? null,
      tags: data.tags && data.tags.length ? JSON.stringify(data.tags) : null,
      status: "PENDING",
    },
    select: { id: true, telegramUsername: true, status: true },
  });

  return NextResponse.json({ ok: true, submission }, { status: 201 });
}

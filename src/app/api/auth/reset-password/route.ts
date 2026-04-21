import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientKey } from "@/lib/ratelimit";

const schema = z.object({
  token: z.string().min(16).max(128),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  const rl = rateLimit(clientKey(req, "reset"), 10, 15 * 60 * 1000);
  if (!rl.success) {
    return NextResponse.json({ error: "TooManyRequests" }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ValidationError" }, { status: 400 });
  }
  const { token, password } = parsed.data;

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpires: { gt: new Date() },
    },
  });
  if (!user) {
    return NextResponse.json({ error: "invalidToken" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      resetToken: null,
      resetTokenExpires: null,
    },
  });

  return NextResponse.json({ ok: true });
}

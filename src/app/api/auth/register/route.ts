import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail, welcomeEmail, verifyEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  username: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
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
  const { name, username, email, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { id: true, email: true, username: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: existing.email === email ? "emailTaken" : "usernameTaken" },
      { status: 409 },
    );
  }

  const hashed = await bcrypt.hash(password, 12);
  const emailVerifyToken = randomBytes(32).toString("hex");
  const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await prisma.user.create({
    data: {
      name,
      username,
      email,
      password: hashed,
      role: "USER",
      emailVerifyToken,
      emailVerifyExpires,
    },
    select: { id: true, email: true, username: true, name: true },
  });

  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const verifyUrl = `${appUrl}/verify-email?token=${emailVerifyToken}`;
  await sendEmail({
    to: email,
    subject: "Verify your email",
    html: verifyEmail({ userName: name, verifyUrl }),
  });
  await sendEmail({
    to: email,
    subject: "Welcome to TgDir",
    html: welcomeEmail({ userName: name, loginUrl: `${appUrl}/dashboard` }),
  });

  return NextResponse.json({ ok: true, user }, { status: 201 });
}

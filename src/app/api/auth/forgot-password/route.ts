import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail, resetPasswordEmail } from "@/lib/email";
import { rateLimit, clientKey } from "@/lib/ratelimit";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export async function POST(req: Request) {
  const rl = rateLimit(clientKey(req, "forgot"), 5, 15 * 60 * 1000);
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
    return NextResponse.json({ ok: true }); // do not leak validation details
  }
  const { email } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpires: expires },
    });
    const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: resetPasswordEmail({
        userName: user.name,
        resetUrl: `${appUrl}/reset-password?token=${token}`,
      }),
    });
  }

  // Always return success to prevent email enumeration.
  return NextResponse.json({ ok: true });
}

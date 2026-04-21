import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isStaff } from "@/lib/rbac";
import { getChatInfo } from "@/lib/telegram";
import { sendEmail, channelApprovedEmail, channelRejectedEmail } from "@/lib/email";

const ACTIONS = ["approve", "reject", "revision"] as const;

export async function POST(
  req: Request,
  { params }: { params: { id: string; action: string } },
) {
  const user = await getCurrentUser();
  if (!user || !isStaff(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const id = Number(params.id);
  const action = params.action as (typeof ACTIONS)[number];
  if (!id || !ACTIONS.includes(action)) {
    return NextResponse.json({ error: "BadRequest" }, { status: 400 });
  }
  const submission = await prisma.channelSubmission.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!submission) return NextResponse.json({ error: "NotFound" }, { status: 404 });
  if (submission.status !== "PENDING") {
    return NextResponse.json({ error: "alreadyReviewed" }, { status: 400 });
  }

  const note = await req
    .json()
    .then((j) => (typeof (j as { note?: unknown }).note === "string" ? (j as { note: string }).note : null))
    .catch(() => null);

  if (action === "approve") {
    const existing = await prisma.channel.findUnique({
      where: { username: submission.telegramUsername },
    });
    if (existing) {
      return NextResponse.json({ error: "alreadyListed" }, { status: 409 });
    }
    const info = await getChatInfo(submission.telegramUsername);
    const channel = await prisma.channel.create({
      data: {
        telegramId: info.ok ? info.telegramId : null,
        username: submission.telegramUsername,
        title: submission.title ?? submission.telegramUsername,
        description: submission.description ?? (info.ok ? (info.description ?? null) : null),
        type: submission.type,
        memberCount: info.ok ? (info.memberCount ?? 0) : 0,
        language: submission.language,
        categoryId: submission.categoryId,
        inviteLink: submission.inviteLink,
        submittedById: submission.userId,
        isActive: true,
      },
    });
    await prisma.channelSubmission.update({
      where: { id },
      data: {
        status: "APPROVED",
        reviewedById: Number(user.id),
        reviewedAt: new Date(),
        channelId: channel.id,
        reviewNote: note,
      },
    });
    if (submission.categoryId) {
      await prisma.category.update({
        where: { id: submission.categoryId },
        data: { channelCount: { increment: 1 } },
      });
    }
    const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    await sendEmail({
      to: submission.user.email,
      subject: `@${submission.telegramUsername} is now listed on TgDir`,
      html: channelApprovedEmail({
        userName: submission.user.name,
        channelUsername: submission.telegramUsername,
        channelUrl: `${appUrl}/channels/${submission.telegramUsername}`,
      }),
    });
  } else if (action === "reject") {
    await prisma.channelSubmission.update({
      where: { id },
      data: {
        status: "REJECTED",
        reviewedById: Number(user.id),
        reviewedAt: new Date(),
        reviewNote: note,
      },
    });
    await sendEmail({
      to: submission.user.email,
      subject: `Submission for @${submission.telegramUsername} was not approved`,
      html: channelRejectedEmail({
        userName: submission.user.name,
        channelUsername: submission.telegramUsername,
        reason: note ?? "Please review the channel guidelines and submit again.",
      }),
    });
  } else {
    await prisma.channelSubmission.update({
      where: { id },
      data: {
        status: "REVISION_REQUESTED",
        reviewedById: Number(user.id),
        reviewedAt: new Date(),
        reviewNote: note,
      },
    });
  }

  return NextResponse.json({ ok: true });
}

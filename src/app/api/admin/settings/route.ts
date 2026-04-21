import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";

const schema = z.object({
  siteName: z.string().trim().min(1).max(120).optional(),
  defaultLanguage: z.string().trim().min(2).max(4).optional(),
  maintenanceMode: z.boolean().optional(),
  adsEnabled: z.boolean().optional(),
  maxChannelsPerUser: z.number().int().positive().max(1000).optional(),
  autoApproveMinMembers: z.number().int().nonnegative().nullable().optional(),
  analyticsId: z.string().max(120).optional(),
  bankTransferInfo: z.string().max(2000).optional(),
  bannedWords: z.string().max(10_000).optional(),
});

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: parsed.data,
    create: { id: 1, ...parsed.data },
  });
  return NextResponse.json({ ok: true, settings });
}

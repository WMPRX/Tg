import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";

const schema = z.object({
  metaKeywords: z.string().max(10_000).optional(),
  metaDescription: z.string().max(10_000).optional(),
  siteDescription: z.string().max(10_000).optional(),
  socialLinks: z.string().max(10_000).optional(),
});

function assertJson(value: string, key: string) {
  if (value.trim() === "") return;
  try {
    JSON.parse(value);
  } catch {
    throw new Error(`${key} is not valid JSON`);
  }
}

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
  if (!parsed.success) return NextResponse.json({ error: "ValidationError" }, { status: 400 });

  try {
    for (const [k, v] of Object.entries(parsed.data)) {
      if (typeof v === "string") assertJson(v, k);
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "invalidJson" },
      { status: 400 },
    );
  }

  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: parsed.data,
    create: { id: 1, ...parsed.data },
  });
  return NextResponse.json({ ok: true, settings });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isStaff } from "@/lib/rbac";
import { slugify } from "@/lib/utils";

const patchSchema = z.object({
  slug: z.string().trim().min(2).max(80).optional(),
  title: z.record(z.string()).or(z.string()).optional(),
  content: z.record(z.string()).or(z.string()).optional(),
  metaTitle: z.string().max(200).nullable().optional(),
  metaDescription: z.string().max(500).nullable().optional(),
  metaKeywords: z.string().max(500).nullable().optional(),
  isPublished: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !isStaff(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const id = Number(params.id);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "ValidationError" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (parsed.data.slug !== undefined) data.slug = slugify(parsed.data.slug);
  if (parsed.data.title !== undefined)
    data.title =
      typeof parsed.data.title === "string"
        ? JSON.stringify({ en: parsed.data.title })
        : JSON.stringify(parsed.data.title);
  if (parsed.data.content !== undefined)
    data.content =
      typeof parsed.data.content === "string"
        ? JSON.stringify({ en: parsed.data.content })
        : JSON.stringify(parsed.data.content);
  if (parsed.data.metaTitle !== undefined) data.metaTitle = parsed.data.metaTitle;
  if (parsed.data.metaDescription !== undefined) data.metaDescription = parsed.data.metaDescription;
  if (parsed.data.metaKeywords !== undefined) data.metaKeywords = parsed.data.metaKeywords;
  if (parsed.data.isPublished !== undefined) data.isPublished = parsed.data.isPublished;

  try {
    const page = await prisma.page.update({ where: { id }, data });
    return NextResponse.json({ ok: true, page });
  } catch {
    return NextResponse.json({ error: "updateFailed" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !isStaff(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const id = Number(params.id);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try {
    await prisma.page.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "deleteFailed" }, { status: 400 });
  }
}

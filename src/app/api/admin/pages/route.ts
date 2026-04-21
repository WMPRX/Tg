import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isStaff } from "@/lib/rbac";
import { slugify } from "@/lib/utils";

const schema = z.object({
  slug: z.string().trim().min(2).max(80),
  title: z.record(z.string()).or(z.string()),
  content: z.record(z.string()).or(z.string()),
  metaTitle: z.string().max(200).nullable().optional(),
  metaDescription: z.string().max(500).nullable().optional(),
  metaKeywords: z.string().max(500).nullable().optional(),
  isPublished: z.boolean().optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !isStaff(user.role)) {
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
  const { slug, title, content, metaTitle, metaDescription, metaKeywords, isPublished } =
    parsed.data;
  const titleJson = typeof title === "string" ? JSON.stringify({ en: title }) : JSON.stringify(title);
  const contentJson =
    typeof content === "string" ? JSON.stringify({ en: content }) : JSON.stringify(content);
  try {
    const page = await prisma.page.create({
      data: {
        slug: slugify(slug),
        title: titleJson,
        content: contentJson,
        metaTitle: metaTitle ?? null,
        metaDescription: metaDescription ?? null,
        metaKeywords: metaKeywords ?? null,
        isPublished: isPublished ?? true,
      },
    });
    return NextResponse.json({ ok: true, page }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "slugTaken" }, { status: 409 });
  }
}

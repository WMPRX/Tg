import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isStaff } from "@/lib/rbac";
import { slugify } from "@/lib/utils";

const schema = z.object({
  slug: z.string().trim().min(2).max(60),
  name: z.record(z.string()).or(z.string()),
  icon: z.string().max(8).nullable().optional(),
  description: z.record(z.string()).optional(),
  parentId: z.number().int().positive().nullable().optional(),
  order: z.number().int().optional(),
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
  const { slug, name, icon, description, parentId, order } = parsed.data;
  const nameJson = typeof name === "string" ? JSON.stringify({ en: name }) : JSON.stringify(name);
  const descJson = description ? JSON.stringify(description) : null;
  try {
    const category = await prisma.category.create({
      data: {
        slug: slugify(slug),
        name: nameJson,
        icon: icon ?? null,
        description: descJson,
        parentId: parentId ?? null,
        order: order ?? 0,
      },
    });
    return NextResponse.json({ ok: true, category }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "slugTaken" }, { status: 409 });
  }
}

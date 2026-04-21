import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isStaff } from "@/lib/rbac";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(1).max(60),
  slug: z.string().trim().min(1).max(60),
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
  if (!parsed.success) return NextResponse.json({ error: "ValidationError" }, { status: 400 });
  try {
    const tag = await prisma.tag.create({
      data: { name: parsed.data.name, slug: slugify(parsed.data.slug) },
    });
    return NextResponse.json({ ok: true, tag }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "slugTaken" }, { status: 409 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isStaff } from "@/lib/rbac";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !isStaff(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "BadRequest" }, { status: 400 });
  await prisma.tag.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

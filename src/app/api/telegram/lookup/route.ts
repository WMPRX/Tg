import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/rbac";
import { getChatInfo } from "@/lib/telegram";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const username = url.searchParams.get("username")?.replace(/^@/, "").trim() ?? "";
  if (!username || !/^[a-zA-Z0-9_]{3,32}$/.test(username)) {
    return NextResponse.json({ error: "invalidUsername" }, { status: 400 });
  }
  const info = await getChatInfo(username);
  if (!info.ok) return NextResponse.json({ ok: false, error: info.error }, { status: 404 });
  const { ok: _ok, ...payload } = info;
  return NextResponse.json({ ok: true, ...payload });
}

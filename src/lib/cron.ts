import { NextResponse } from "next/server";

export function assertCronSecret(req: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const header = req.headers.get("authorization") ?? req.headers.get("x-cron-secret") ?? "";
  const token = header.replace(/^Bearer\s+/i, "");
  if (token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

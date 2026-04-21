/**
 * Lightweight in-memory fixed-window rate limiter.
 *
 * Swap for `@upstash/ratelimit` (or Redis) in production — the interface
 * matches closely enough that call sites won't change. For serverless
 * deployments this falls back to per-instance memory which is best-effort
 * only; use Upstash/Vercel KV behind this API when running on multiple
 * instances.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: number;
};

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }
  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  return {
    success: existing.count <= limit,
    remaining,
    resetAt: existing.resetAt,
  };
}

export function clientKey(req: Request, suffix: string) {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim() ?? "anon";
  return `${suffix}:${ip}`;
}

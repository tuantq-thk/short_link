import { RATE_LIMIT_MAX_CREATES, RATE_LIMIT_WINDOW_SECONDS } from '@/lib/constants';

/** Best-effort per-isolate throttle. Add a shared KV/Redis limiter before broad promotion. */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkCreateRateLimit(ip: string, cost = 1, now = Date.now()) {
  const key = ip || 'unknown';
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: cost, resetAt: now + RATE_LIMIT_WINDOW_SECONDS * 1000 });
    return { allowed: cost <= RATE_LIMIT_MAX_CREATES, remaining: RATE_LIMIT_MAX_CREATES - cost };
  }
  if (current.count + cost > RATE_LIMIT_MAX_CREATES) {
    return { allowed: false as const, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  }
  current.count += cost;
  return { allowed: true as const, remaining: RATE_LIMIT_MAX_CREATES - current.count };
}

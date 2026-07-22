type Entry = { count: number; resetAt: number };
const buckets = new Map<string, Entry>();

export function rateLimit(key: string, limit = 30, windowMs = 60_000) {
  const now = Date.now();
  const previous = buckets.get(key);
  const entry = !previous || previous.resetAt < now ? { count: 0, resetAt: now + windowMs } : previous;
  entry.count += 1;
  buckets.set(key, entry);
  return { allowed: entry.count <= limit, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
}

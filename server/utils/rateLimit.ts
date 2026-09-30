import type { H3Event } from 'h3'

// Per server instance, so a determined abuser spread over many Netlify instances
// gets through. It still stops one browser or script from hammering an endpoint.
const hits = new Map<string, number[]>()

export function rateLimit(event: H3Event, bucket: string, limit: number, windowSeconds: number): void {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const key = `${bucket}:${ip}`
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter(time => now - time < windowSeconds * 1000)

  if (recent.length >= limit) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests. Wait a minute and try again.' })
  }
  recent.push(now)
  hits.set(key, recent)

  if (hits.size > 5000) hits.clear()
}

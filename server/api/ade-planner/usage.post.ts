import { recordAdeStats } from '../../utils/ade-planner/stats'

const FEATURE = /^ade-[a-z-]{2,40}(:[a-z0-9-]{1,30})?$/

/**
 * Feature-use counts from the planner ("ade-free-open", "ade-budget:25"), batched by
 * the client (app/utils/track.js). VAMS adds them to today's ade-usage entry. Anonymous.
 */
export default defineEventHandler(async (event) => {
  rateLimit(event, 'usage', 30, 60)
  const body = await readBody<{ features?: unknown }>(event)
  const features = (Array.isArray(body?.features) ? body.features : [])
    .filter((feature): feature is string => typeof feature === 'string' && FEATURE.test(feature))
    .slice(0, 50)
  if (features.length) await recordAdeStats(null, { features })
  return { ok: true, counted: features.length }
})

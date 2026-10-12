import { loadAdeData } from '../../utils/ade-planner/data'
import { resolveEventId } from '../../utils/ade-planner/duplicates'
import { favoriteDelta, recordAdeStats } from '../../utils/ade-planner/stats'

/** Counts a star or unstar on an event (anonymous). The plan itself stays in the browser. */
export default defineEventHandler(async (event) => {
  rateLimit(event, 'favorite', 60, 60)
  const body = await readBody<{ eventId?: unknown, action?: unknown }>(event)
  const rawId = typeof body?.eventId === 'string' ? body.eventId : ''
  const action = body?.action === 'remove' ? 'remove' : 'add'

  const data = await loadAdeData()
  // Plans saved before a duplicate was merged still carry the old id.
  const eventId = resolveEventId(data, rawId)
  if (!data.events.some(item => item.id === eventId)) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown event.' })
  }

  const delta = favoriteDelta(event, eventId, action)
  if (delta) await recordAdeStats(data, { favorites: [{ id: eventId, delta }] })
  return { ok: true }
})

import { loadAdeData } from '../../utils/ade-planner/data'
import { favoriteDelta, recordAdeStats } from '../../utils/ade-planner/stats'

/** Counts a star or unstar on an event (anonymous). The plan itself stays in the browser. */
export default defineEventHandler(async (event) => {
  rateLimit(event, 'favorite', 60, 60)
  const body = await readBody<{ eventId?: unknown, action?: unknown }>(event)
  const eventId = typeof body?.eventId === 'string' ? body.eventId : ''
  const action = body?.action === 'remove' ? 'remove' : 'add'

  const data = await loadAdeData()
  if (!data.events.some(item => item.id === eventId)) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown event.' })
  }

  const delta = favoriteDelta(event, eventId, action)
  if (delta) await recordAdeStats(data, { favorites: [{ id: eventId, delta }] })
  return { ok: true }
})

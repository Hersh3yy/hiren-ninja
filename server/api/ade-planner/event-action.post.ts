import { loadAdeData } from '../../utils/ade-planner/data'
import { resolveEventId } from '../../utils/ade-planner/duplicates'
import { firstEventAction, recordAdeStats } from '../../utils/ade-planner/stats'

/** Counts an opened event or a click to its ticket shop, resale or ADE page (anonymous). */
export default defineEventHandler(async (event) => {
  rateLimit(event, 'event-action', 120, 60)
  const body = await readBody<{ eventId?: unknown, action?: unknown }>(event)
  const rawId = typeof body?.eventId === 'string' ? body.eventId : ''
  const action = body?.action === 'ticket' ? 'ticket' : 'open'

  const data = await loadAdeData()
  // Plans saved before a duplicate was merged still carry the old id.
  const eventId = resolveEventId(data, rawId)
  if (!data.events.some(item => item.id === eventId)) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown event.' })
  }

  if (firstEventAction(event, eventId, action)) {
    await recordAdeStats(data, action === 'ticket' ? { ticketClicks: [eventId] } : { opens: [eventId] })
  }
  return { ok: true }
})

import { loadAdeData } from '../../utils/ade-planner/data'
import { firstEventAction, recordAdeStats } from '../../utils/ade-planner/stats'

/** Counts an opened event or a click to its ticket shop, resale or ADE page (anonymous). */
export default defineEventHandler(async (event) => {
  rateLimit(event, 'event-action', 120, 60)
  const body = await readBody<{ eventId?: unknown, action?: unknown }>(event)
  const eventId = typeof body?.eventId === 'string' ? body.eventId : ''
  const action = body?.action === 'ticket' ? 'ticket' : 'open'

  const data = await loadAdeData()
  if (!data.events.some(item => item.id === eventId)) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown event.' })
  }

  if (firstEventAction(event, eventId, action)) {
    await recordAdeStats(data, action === 'ticket' ? { ticketClicks: [eventId] } : { opens: [eventId] })
  }
  return { ok: true }
})

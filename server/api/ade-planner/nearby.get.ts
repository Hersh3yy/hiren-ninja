import { loadAdeData } from '../../utils/ade-planner/data'
import { eventsNearby } from '../../utils/ade-planner/nearby'

/**
 * GET ?lat=&lng=[&at=ISO] — what starts in the next two hours near you. The location
 * is used for this answer only; it is not stored or logged. `at` previews another moment.
 */
export default defineEventHandler(async (event) => {
  rateLimit(event, 'nearby', 30, 60)
  const query = getQuery(event)
  const lat = Number(query.lat)
  const lng = Number(query.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    throw createError({ statusCode: 400, statusMessage: 'Pass ?lat= and ?lng=' })
  }
  const at = typeof query.at === 'string' && !Number.isNaN(Date.parse(query.at)) ? new Date(query.at) : new Date()
  return { at: at.toISOString(), events: eventsNearby(await loadAdeData(), at, { lat, lng }) }
})

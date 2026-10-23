import { loadAdeData } from '../../utils/ade-planner/data'
import { withLineupNames } from '../../utils/ade-planner/seo'

const HOUR = 3_600_000

/**
 * GET ?from=ISO&to=ISO — every event with a known place that is on during that window
 * (started and not over, or starting in it), for the planner's map. Distances and the
 * radius are worked out in the browser: the location never leaves the device.
 */
export default defineEventHandler(async (event) => {
  rateLimit(event, 'map', 60, 60)
  const query = getQuery(event)
  const from = Date.parse(String(query.from ?? ''))
  const to = Date.parse(String(query.to ?? ''))
  if (Number.isNaN(from) || Number.isNaN(to) || to <= from || to - from > 36 * HOUR) {
    throw createError({ statusCode: 400, statusMessage: 'Pass ?from= and ?to= (ISO, at most 36 hours apart).' })
  }
  const data = await loadAdeData()
  const onNow = data.events.filter((item) => {
    // Parties and concerts only: the daytime programme is over (removed 23 Oct).
    if (item.isParty === false || !item.place || item.format === 'tba') return false
    const start = Date.parse(item.startsAt)
    const end = item.endsAt ? Date.parse(item.endsAt) : start + 2 * HOUR
    // Week-long exhibitions would fill every map: drop-ins only while they're on, sessions as planned.
    return start <= to && end >= from && end - start <= 24 * HOUR
  })
  return withLineupNames(data, onNow).slice(0, 500)
})

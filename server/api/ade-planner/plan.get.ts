import { loadAdeData } from '../../utils/ade-planner/data'
import { decodePlan } from '../../utils/ade-planner/plan-link'
import { sharedPlanEvents } from '../../utils/ade-planner/share'

/** GET ?plan=<code> — the events in a shared plan link (no login, nothing stored). */
export default defineEventHandler(async (event) => {
  rateLimit(event, 'plan', 60, 60)
  const ids = decodePlan(String(getQuery(event).plan ?? ''))
  if (ids.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'This plan link is empty or broken.' })
  }
  return sharedPlanEvents(await loadAdeData(), ids)
})

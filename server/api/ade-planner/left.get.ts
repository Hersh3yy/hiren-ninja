import { loadAdeData } from '../../utils/ade-planner/data'
import { LEFT_BUDGETS, type LeftBudget, whatsLeft } from '../../utils/ade-planner/highlights'

/** GET ?day=YYYY-MM-DD&budget=(|50|25|free) — "What's left" for one ADE day. */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const day = String(query.day ?? '')
  if (!/^2026-10-2[1-5]$/.test(day)) throw createError({ statusCode: 400, statusMessage: 'Pass ?day= (an ADE day, YYYY-MM-DD).' })
  const budget = (LEFT_BUDGETS as string[]).includes(String(query.budget ?? '')) ? String(query.budget ?? '') as LeftBudget : ''
  return whatsLeft(await loadAdeData(), day, budget)
})

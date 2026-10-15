import { loadAdeData } from '../../../../utils/ade-planner/data'
import { ADE_DAYS, dayProgram } from '../../../../utils/ade-planner/seo'

/** Data for /ade-planner/<weekday>: that day's parties and concerts. */
export default defineEventHandler(async (event) => {
  const day = ADE_DAYS.find(d => d.slug === getRouterParam(event, 'day'))
  if (!day) throw createError({ statusCode: 404, statusMessage: 'Not an ADE day.' })
  return { day, ...dayProgram(await loadAdeData(), day.date) }
})

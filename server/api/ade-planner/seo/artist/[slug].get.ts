import { loadAdeData } from '../../../../utils/ade-planner/data'
import { artistPage } from '../../../../utils/ade-planner/seo'

/** Data for /ade-planner/artist/<slug>: where and when one artist plays ADE. */
export default defineEventHandler(async (event) => {
  const page = artistPage(await loadAdeData(), String(getRouterParam(event, 'slug') ?? ''))
  if (!page) throw createError({ statusCode: 404, statusMessage: 'Not on the ADE 2026 lineup.' })
  return page
})

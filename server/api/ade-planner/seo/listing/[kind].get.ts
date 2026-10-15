import { loadAdeData } from '../../../../utils/ade-planner/data'
import { type ListingKind, listing } from '../../../../utils/ade-planner/seo'

const KINDS: ListingKind[] = ['genre', 'venue', 'lab', 'pro']

/** Data for the genre, venue, ADE Lab and ADE Pro pages: /listing/genre?slug=techno */
export default defineEventHandler(async (event) => {
  const kind = getRouterParam(event, 'kind') as ListingKind
  if (!KINDS.includes(kind)) throw createError({ statusCode: 404, statusMessage: 'Unknown listing.' })
  const page = listing(await loadAdeData(), kind, String(getQuery(event).slug ?? ''))
  if (!page) throw createError({ statusCode: 404, statusMessage: 'Nothing on the ADE 2026 program.' })
  return page
})

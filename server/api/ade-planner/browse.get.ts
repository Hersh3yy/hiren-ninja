import type { BrowseFilters } from '../../types/ade-planner'
import { browseDaytime } from '../../utils/ade-planner/browse'
import { loadAdeData } from '../../utils/ade-planner/data'

const list = (value: unknown): string[] =>
  String(value ?? '').split(',').map(item => item.trim()).filter(Boolean).slice(0, 20)

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const filters = {
    q: String(query.q ?? '').slice(0, 200),
    kinds: list(query.kinds),
    times: list(query.times),
    access: list(query.access),
    areas: list(query.areas),
    genres: list(query.genres),
  } as BrowseFilters
  const offset = Math.max(0, Number(query.offset) || 0)
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 20))

  return browseDaytime(await loadAdeData(), filters, offset, limit)
})

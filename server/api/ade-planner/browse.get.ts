import type { BrowseFilters } from '../../types/ade-planner'
import { browseDaytime } from '../../utils/ade-planner/browse'
import { loadAdeData } from '../../utils/ade-planner/data'

const list = (value: unknown): string[] =>
  String(value ?? '').split(',').map(item => item.trim()).filter(Boolean).slice(0, 20)

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const day = String(query.day ?? '')
  const filters = {
    q: String(query.q ?? '').slice(0, 200),
    day: /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : '',
    hasProPass: query.pro === '1',
    intents: list(query.intents),
    kinds: list(query.kinds),
    times: list(query.times),
    access: list(query.access),
    areas: list(query.areas),
    genres: list(query.genres),
  } as BrowseFilters

  return browseDaytime(await loadAdeData(), filters)
})

import { loadAdeData } from '../../utils/ade-planner/data'
import { matchArtists } from '../../utils/ade-planner/match'

const MAX_ARTISTS = 500

export default defineEventHandler(async (event) => {
  const body = await readBody<{ artists?: { name: string, weight?: number }[] }>(event)
  const queries = (body?.artists ?? [])
    .filter(item => typeof item?.name === 'string' && item.name.trim())
    .slice(0, MAX_ARTISTS)
    .map(item => ({ name: item.name.trim().slice(0, 200), weight: Number(item.weight) || 1 }))

  if (queries.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Send at least one artist name.' })
  }

  const data = await loadAdeData()
  return { source: data.source, ...matchArtists(data, queries) }
})

import { loadAdeData } from '../../utils/ade-planner/data'
import { suggestArtists } from '../../utils/ade-planner/similar'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ artists?: { name: string, weight?: number }[], matchedArtistIds?: string[] }>(event)
  const seeds = (body?.artists ?? [])
    .filter(item => typeof item?.name === 'string' && item.name.trim())
    .slice(0, 500)
    .map(item => ({ name: item.name.trim().slice(0, 200), weight: Number(item.weight) || 1 }))
  const matchedArtistIds = (body?.matchedArtistIds ?? []).filter(id => typeof id === 'string').slice(0, 500)

  return suggestArtists(await loadAdeData(), seeds, matchedArtistIds)
})

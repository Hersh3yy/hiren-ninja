import { loadAdeData } from '../../utils/ade-planner/data'
import { getEventsForArtist } from '../../utils/ade-planner/match'

export default defineEventHandler(async (event) => {
  const artist = String(getQuery(event).artist ?? '').trim()
  if (!artist) {
    throw createError({ statusCode: 400, statusMessage: 'Pass ?artist=<name>' })
  }

  return getEventsForArtist(await loadAdeData(), artist)
})

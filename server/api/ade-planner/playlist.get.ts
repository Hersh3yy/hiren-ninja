import { readPlaylistArtists } from '../../utils/ade-planner/playlist'

const readCached = defineCachedFunction(readPlaylistArtists, {
  name: 'ade-planner-playlist',
  maxAge: 60 * 10,
  getKey: (url: string) => url,
})

export default defineEventHandler(async (event) => {
  const url = String(getQuery(event).url ?? '').trim()
  return readCached(url)
})

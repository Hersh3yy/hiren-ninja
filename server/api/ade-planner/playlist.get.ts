import { readPlaylistArtists } from '../../utils/ade-planner/playlist'

const readCached = defineCachedFunction(readPlaylistArtists, {
  name: 'ade-planner-playlist',
  maxAge: 60 * 10,
  // Storage keys split on ':' and '/', so a raw URL collapsed every playlist into one "https" entry.
  getKey: (url: string) => url.replace(/[^A-Za-z0-9]/g, '_'),
})

export default defineEventHandler(async (event) => {
  rateLimit(event, 'playlist', 20, 60)
  const url = String(getQuery(event).url ?? '').trim()
  return readCached(url)
})

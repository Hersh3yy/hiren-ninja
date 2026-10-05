import type { PlaylistArtists } from '../../types/ade-planner'

// Tidal and Deezer both expose public playlists over JSON without an account:
// Deezer has a documented, keyless API; Tidal's web player API takes the public
// token its own web client ships (not a secret). Both page 100 tracks at a time.

// Ten pages of 100 is ~4s, well inside the 10s function limit.
const MAX_TRACKS = 1_000

export const TIDAL_URL = /^https:\/\/(?:listen\.|www\.)?tidal\.com\/(?:browse\/)?playlist\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
export const DEEZER_URL = /^https:\/\/(?:www\.)?deezer\.com\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?playlist\/(\d+)/i
// Shared from the app: link.deezer.com/s/... and deezer.page.link/... redirect to the playlist.
export const DEEZER_SHORT_URL = /^https:\/\/(?:link\.deezer\.com|deezer\.page\.link)\//i

const TIDAL_API = 'https://api.tidal.com/v1'
const TIDAL_WEB_TOKEN = 'CzET4vdadNUFQ5JU'

interface Artistish { name?: string }

function tally(names: string[]): PlaylistArtists['artists'] {
  const counts = new Map<string, number>()
  for (const raw of names) {
    const name = raw.replace(/\u00A0/g, ' ').trim()
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  return [...counts].map(([name, tracks]) => ({ name, tracks })).sort((a, b) => b.tracks - a.tracks)
}

const notReadable = (service: string) => createError({
  statusCode: 502,
  statusMessage: `Could not read that ${service} playlist. Is it public, and is the link complete?`,
})

export async function readTidal(uuid: string): Promise<PlaylistArtists> {
  const headers = { 'x-tidal-token': TIDAL_WEB_TOKEN }
  const query = { countryCode: 'NL' }
  const playlist = await $fetch<{ title?: string, numberOfTracks?: number }>(`${TIDAL_API}/playlists/${uuid}`, { headers, query, timeout: 6_000 })
    .catch(() => { throw notReadable('Tidal') })

  const tracks: string[][] = []
  let complete = true
  for (let offset = 0; offset < Math.min(playlist.numberOfTracks ?? MAX_TRACKS, MAX_TRACKS); offset += 100) {
    const page = await $fetch<{ items?: { type?: string, item?: { artists?: Artistish[] } }[] }>(`${TIDAL_API}/playlists/${uuid}/items`, {
      headers,
      query: { ...query, limit: 100, offset },
      timeout: 6_000,
    }).catch(() => null)
    if (!page) {
      complete = false
      break
    }
    // Videos are items too; they have artists as well, so keep them.
    tracks.push(...(page.items ?? []).map(entry => (entry.item?.artists ?? []).map(artist => artist.name ?? '').filter(Boolean)))
    if ((page.items ?? []).length < 100) break
  }

  return {
    source: 'tidal',
    title: playlist.title ?? 'Tidal playlist',
    trackCount: tracks.length,
    totalTracks: Math.max(playlist.numberOfTracks ?? 0, tracks.length),
    partial: !complete,
    artists: tally(tracks.flat()),
  }
}

/** A short share link's target, without downloading the page it lands on. */
export async function resolveDeezerShortLink(url: string): Promise<string> {
  const response = await $fetch.raw(url, { method: 'HEAD', redirect: 'manual', timeout: 5_000, ignoreResponseError: true }).catch(() => null)
  const location = response?.headers.get('location') ?? ''
  if (!DEEZER_URL.test(location)) throw notReadable('Deezer')
  return location
}

export async function readDeezer(id: string): Promise<PlaylistArtists> {
  const playlist = await $fetch<{ title?: string, nb_tracks?: number, error?: unknown }>(`https://api.deezer.com/playlist/${id}`, { timeout: 6_000 })
    .catch(() => null)
  // Deezer answers private or missing playlists with 200 and an error object.
  if (!playlist || playlist.error) throw notReadable('Deezer')

  const tracks: string[][] = []
  let complete = true
  for (let index = 0; index < Math.min(playlist.nb_tracks ?? MAX_TRACKS, MAX_TRACKS); index += 100) {
    const page = await $fetch<{ data?: { artist?: Artistish }[], error?: unknown }>(`https://api.deezer.com/playlist/${id}/tracks`, {
      query: { index, limit: 100 },
      timeout: 6_000,
    }).catch(() => null)
    if (!page || page.error) {
      complete = false
      break
    }
    // The playlist list only carries each track's main artist.
    tracks.push(...(page.data ?? []).map(track => [track.artist?.name ?? ''].filter(Boolean)))
    if ((page.data ?? []).length < 100) break
  }

  return {
    source: 'deezer',
    title: playlist.title ?? 'Deezer playlist',
    trackCount: tracks.length,
    totalTracks: Math.max(playlist.nb_tracks ?? 0, tracks.length),
    partial: !complete,
    artists: tally(tracks.flat()),
  }
}

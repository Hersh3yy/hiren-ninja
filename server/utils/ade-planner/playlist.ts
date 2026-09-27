import type { PlaylistArtists } from '../../types/ade-planner'

// Public pages, not official APIs: the Spotify Web API refuses playlists the
// caller doesn't own, and Apple's API needs a paid developer account. Both
// pages ship the track list as JSON for their own front end.
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36'

const SPOTIFY_URL = /^https:\/\/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(playlist|album)\/([A-Za-z0-9]{10,40})/
const APPLE_URL = /^https:\/\/music\.apple\.com\/([a-z]{2})\/(playlist|album)\/[^/?#]+\/((?:pl\.)?[A-Za-z0-9.-]+)/

export function isPlaylistUrl(value: string): boolean {
  return SPOTIFY_URL.test(value) || APPLE_URL.test(value)
}

function tally(names: string[]): PlaylistArtists['artists'] {
  const counts = new Map<string, number>()
  for (const raw of names) {
    const name = raw.replace(/\u00A0/g, ' ').trim()
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  return [...counts].map(([name, tracks]) => ({ name, tracks })).sort((a, b) => b.tracks - a.tracks)
}

async function fetchPage(url: string): Promise<string> {
  return $fetch<string>(url, { headers: { 'User-Agent': USER_AGENT }, responseType: 'text', timeout: 15_000 })
}

function extractScript(html: string, pattern: RegExp): unknown {
  const match = html.match(pattern)
  if (!match?.[1]) {
    throw createError({ statusCode: 502, statusMessage: 'Could not read that playlist page. Is it public?' })
  }
  return JSON.parse(match[1])
}

async function readSpotify(kind: string, id: string): Promise<PlaylistArtists> {
  const html = await fetchPage(`https://open.spotify.com/embed/${kind}/${id}`)
  const nextData = extractScript(html, /<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s) as {
    props: { pageProps: { state: { data: { entity: { name?: string, title?: string, trackList?: { subtitle?: string }[] } } } } }
  }
  const entity = nextData.props.pageProps.state.data.entity
  const tracks = entity.trackList ?? []

  return {
    source: 'spotify',
    title: entity.name ?? entity.title ?? 'Spotify playlist',
    trackCount: tracks.length,
    artists: tally(tracks.flatMap(track => (track.subtitle ?? '').split(','))),
  }
}

function collectKey(node: unknown, key: string, found: string[] = []): string[] {
  if (Array.isArray(node)) {
    node.forEach(child => collectKey(child, key, found))
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k === key && typeof v === 'string') found.push(v)
      else collectKey(v, key, found)
    }
  }
  return found
}

async function readAppleMusic(storefront: string, kind: string, id: string, originalUrl: string): Promise<PlaylistArtists> {
  const html = await fetchPage(originalUrl.split(/[?#]/)[0] ?? `https://music.apple.com/${storefront}/${kind}/${id}`)
  const data = extractScript(html, /<script type="application\/json" id="serialized-server-data">(.*?)<\/script>/s)
  const title = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] ?? 'Apple Music playlist'
  // Each track row carries artistName; features like "A & B" stay one credit.
  const names = collectKey(data, 'artistName')

  return {
    source: 'apple-music',
    title,
    trackCount: names.length,
    artists: tally(names.flatMap(name => name.split(/,\s*/))),
  }
}

export async function readPlaylistArtists(url: string): Promise<PlaylistArtists> {
  const spotify = url.match(SPOTIFY_URL)
  if (spotify) return readSpotify(spotify[1]!, spotify[2]!)

  const apple = url.match(APPLE_URL)
  if (apple) return readAppleMusic(apple[1]!, apple[2]!, apple[3]!, url)

  throw createError({ statusCode: 400, statusMessage: 'Paste a public Spotify or Apple Music playlist link.' })
}

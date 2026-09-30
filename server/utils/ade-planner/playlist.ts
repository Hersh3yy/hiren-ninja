import type { PlaylistArtists } from '../../types/ade-planner'
import { readYouTubeMusic, youTubeMusicListId } from './youtube-music'

// Public pages, not official APIs: the Spotify Web API refuses playlists the
// caller doesn't own, Apple's API needs a paid developer account, and YouTube's
// needs a key. Each page ships its track list as JSON for its own front end.
// Spotify's embed stops at 100 tracks, then we page on with the embed's own
// anonymous token (user playlists only; Spotify's editorial ones 404). YouTube
// Music pages on through its browse endpoint. Both stop at MAX_TRACKS.
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36'

const MAX_TRACKS = 500

const SPOTIFY_URL = /^https:\/\/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(playlist|album)\/([A-Za-z0-9]{10,40})/
const APPLE_URL = /^https:\/\/music\.apple\.com\/([a-z]{2})\/(playlist|album)\/[^/?#]+\/((?:pl\.)?[A-Za-z0-9.-]+)/

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

interface SpotifyPage { next?: string | null, items?: { track?: { artists?: { name?: string }[] } | null }[] }

/** Tracks 101 and up, as artist lists. Stops quietly on any error: the first 100 still stand. */
async function spotifyTracksAfterEmbed(id: string, token: string, have: number): Promise<string[][]> {
  const pages: string[][] = []
  let url: string | null = `https://api.spotify.com/v1/playlists/${id}/tracks?offset=${have}&limit=100&fields=next,items(track(artists(name)))`
  while (url && have + pages.length < MAX_TRACKS) {
    const page: SpotifyPage | null = await $fetch<SpotifyPage>(url, { headers: { Authorization: `Bearer ${token}` }, timeout: 10_000 }).catch(() => null)
    if (!page?.items?.length) break
    pages.push(...page.items.map(item => (item.track?.artists ?? []).map(artist => artist.name ?? '').filter(Boolean)))
    url = page.next ?? null
  }
  return pages.slice(0, MAX_TRACKS - have)
}

async function readSpotify(kind: string, id: string): Promise<PlaylistArtists> {
  const html = await fetchPage(`https://open.spotify.com/embed/${kind}/${id}`)
  const nextData = extractScript(html, /<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s) as {
    props: { pageProps: { state: {
      data: { entity: { name?: string, title?: string, trackList?: { subtitle?: string }[] } }
      settings?: { session?: { accessToken?: string } }
    } } }
  }
  const { data, settings } = nextData.props.pageProps.state
  const embedTracks = (data.entity.trackList ?? []).map(track => (track.subtitle ?? '').split(','))
  const token = settings?.session?.accessToken

  // The embed shows at most 100; a full page of 100 means there may be more.
  const moreTracks = kind === 'playlist' && embedTracks.length === 100 && token
    ? await spotifyTracksAfterEmbed(id, token, embedTracks.length)
    : []
  const tracks = [...embedTracks, ...moreTracks]

  return {
    source: 'spotify',
    title: data.entity.name ?? data.entity.title ?? 'Spotify playlist',
    trackCount: tracks.length,
    artists: tally(tracks.flat()),
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

  const listId = youTubeMusicListId(url)
  if (listId) {
    const { title, tracks } = await readYouTubeMusic(listId)
    return { source: 'youtube-music', title, trackCount: tracks.length, artists: tally(tracks.flatMap(track => track.artists)) }
  }

  if (/[?&]list=LM(&|$)/.test(url)) {
    throw createError({ statusCode: 400, statusMessage: 'Liked music is private. Copy the songs into a public or unlisted playlist and paste that link.' })
  }

  throw createError({ statusCode: 400, statusMessage: 'Paste a public Spotify, Apple Music or YouTube Music playlist link.' })
}

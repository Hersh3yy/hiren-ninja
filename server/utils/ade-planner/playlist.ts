import type { PlaylistArtists } from '../../types/ade-planner'
import { readYouTubeMusic, youTubeMusicListId } from './youtube-music'
import { DEEZER_SHORT_URL, DEEZER_URL, TIDAL_URL, readDeezer, readTidal, resolveDeezerShortLink } from './tidal-deezer'

// Public pages, not official APIs: the Spotify Web API refuses playlists the
// caller doesn't own, Apple's API needs a paid developer account, and YouTube's
// needs a key. Each page ships its track list as JSON for its own front end.
// Spotify's embed stops at 100 tracks; the rest come from the web player's spclient
// endpoints with the embed's own anonymous token. YouTube Music pages on through
// its browse endpoint. Both stop at MAX_TRACKS.
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
  try {
    return await $fetch<string>(url, { headers: { 'User-Agent': USER_AGENT }, responseType: 'text', timeout: 8_000 })
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Could not open that playlist. Is it public, and is the link complete?' })
  }
}

function extractScript(html: string, pattern: RegExp): unknown {
  const match = html.match(pattern)
  if (!match?.[1]) {
    throw createError({ statusCode: 502, statusMessage: 'Could not read that playlist page. Is it public?' })
  }
  return JSON.parse(match[1])
}

interface SpotifyPlaylistContents { length?: number, contents?: { items?: { uri?: string }[] } }
interface SpotifyTrackMetadata { artist?: { name?: string }[] }

// The web player's own endpoints. Unlike api.spotify.com (which gives the embed token a
// day-long 429 after a handful of calls), they accept the embed's anonymous token.
const SPCLIENT = 'https://spclient.wg.spotify.com'
// Netlify stops a function at 10s; leave room for the embed page and the response.
const SPOTIFY_BUDGET_MS = 6_000
// 50 parallel metadata calls read ~200 tracks a second, so 1,000 fits the budget.
const METADATA_BATCH = 50
const SPOTIFY_MAX_TRACKS = 1_000

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

/** Spotify ids are base62 in URIs and 32-char hex ("gid") in the metadata endpoint. */
export function spotifyGid(id: string): string {
  let n = 0n
  for (const char of id) n = n * 62n + BigInt(BASE62.indexOf(char))
  return n.toString(16).padStart(32, '0')
}

/**
 * Tracks after the embed's first 100, as artist lists: the playlist's track URIs in one
 * call, then each track's artists, a batch at a time, newest first (playlists grow at the
 * end, and recent additions say most about your taste now), until the time budget runs
 * out. Anything Spotify refuses, or what doesn't fit, makes the result partial.
 */
async function spotifyTracksAfterEmbed(id: string, token: string, have: number): Promise<{ tracks: string[][], total: number, complete: boolean }> {
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json', 'User-Agent': USER_AGENT }
  const list = await $fetch<SpotifyPlaylistContents>(`${SPCLIENT}/playlist/v2/playlist/${id}`, {
    query: { from: have, length: SPOTIFY_MAX_TRACKS - have },
    headers,
    timeout: 5_000,
  }).catch(() => null)
  if (!list) return { tracks: [], total: have, complete: false }

  const total = list.length ?? have
  // Local files and podcast episodes have no artists to match.
  const trackIds = (list.contents?.items ?? [])
    .map(item => item.uri?.match(/^spotify:track:([A-Za-z0-9]{22})$/)?.[1])
    .filter((trackId): trackId is string => Boolean(trackId))
    .reverse()

  const deadline = Date.now() + SPOTIFY_BUDGET_MS
  const tracks: string[][] = []
  let complete = true
  for (let i = 0; i < trackIds.length; i += METADATA_BATCH) {
    if (Date.now() > deadline) {
      complete = false
      break
    }
    const batch = await Promise.all(trackIds.slice(i, i + METADATA_BATCH).map(trackId =>
      $fetch<SpotifyTrackMetadata>(`${SPCLIENT}/metadata/4/track/${spotifyGid(trackId)}`, { query: { market: 'from_token' }, headers, timeout: 3_000 })
        .then(track => (track.artist ?? []).map(artist => artist.name ?? '').filter(Boolean))
        .catch(() => null)))
    for (const artists of batch) {
      if (artists) tracks.push(artists)
      else complete = false
    }
  }
  return { tracks, total, complete: complete && have + trackIds.length >= total }
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
  const more = kind === 'playlist' && embedTracks.length === 100 && token
    ? await spotifyTracksAfterEmbed(id, token, embedTracks.length)
    : { tracks: [], total: embedTracks.length, complete: kind !== 'playlist' || embedTracks.length < 100 }
  const tracks = [...embedTracks, ...more.tracks]

  return {
    source: 'spotify',
    title: data.entity.name ?? data.entity.title ?? 'Spotify playlist',
    trackCount: tracks.length,
    totalTracks: Math.max(more.total, tracks.length),
    // Spotify (or the time budget) stopped us; our own MAX_TRACKS cap is shown via totalTracks.
    partial: !more.complete,
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

  const tidal = url.match(TIDAL_URL)
  if (tidal) return readTidal(tidal[1]!.toLowerCase())

  const deezerUrl = DEEZER_SHORT_URL.test(url) ? await resolveDeezerShortLink(url) : url
  const deezer = deezerUrl.match(DEEZER_URL)
  if (deezer) return readDeezer(deezer[1]!)

  if (/[?&]list=LM(&|$)/.test(url)) {
    throw createError({ statusCode: 400, statusMessage: 'Liked music is private. Copy the songs into a public or unlisted playlist and paste that link.' })
  }

  throw createError({ statusCode: 400, statusMessage: 'Paste a public Spotify, Apple Music, YouTube Music, Tidal or Deezer playlist link.' })
}

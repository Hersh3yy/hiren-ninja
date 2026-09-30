// YouTube Music has no public playlist API without a key, but its playlist page
// embeds the first 100 tracks as JSON, with every artist as a separate linked name.
// Longer playlists continue through the page's own browse endpoint.

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36'
// Skips Google's EU consent page, which would otherwise replace the playlist.
const CONSENT_COOKIE = 'SOCS=CAI'
const MAX_TRACKS = 500
const HOSTS = new Set(['music.youtube.com', 'www.youtube.com', 'youtube.com', 'm.youtube.com'])

export interface YouTubeMusicTrack { title: string, artists: string[] }

interface Node { [key: string]: unknown }

/** The playlist id from a YouTube (Music) link, or null. "LM" (Liked music) is private, so null too. */
export function youTubeMusicListId(url: string): string | null {
  try {
    const parsed = new URL(url)
    const list = parsed.searchParams.get('list')
    if (!HOSTS.has(parsed.hostname) || !list || !/^[A-Za-z0-9_-]{10,64}$/.test(list)) return null
    return list
  } catch {
    return null
  }
}

/** The /browse block the page pushes into initialData, decoded from its \xNN-escaped string. */
export function parseYouTubeMusicPage(html: string): { data: Node | null, clientVersion: string | null } {
  const clientVersion = html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/)?.[1] ?? null
  for (const block of html.split('initialData.push(').slice(1)) {
    if (!block.slice(0, 40).includes('\\/browse')) continue
    const raw = block.match(/data: '(.*?)'\}\);/s)?.[1]
    if (!raw) continue
    const json = raw
      .replace(/\\x([0-9a-fA-F]{2})/g, (_, hex: string) => String.fromCharCode(Number.parseInt(hex, 16)))
      .replace(/\\\\/g, '\\')
    return { data: JSON.parse(json) as Node, clientVersion }
  }
  return { data: null, clientVersion }
}

function walk(node: unknown, visit: (node: Node) => void): void {
  if (Array.isArray(node)) {
    node.forEach(child => walk(child, visit))
  } else if (node && typeof node === 'object') {
    visit(node as Node)
    Object.values(node).forEach(child => walk(child, visit))
  }
}

interface Run { text?: string, navigationEndpoint?: unknown }

/** Track rows with their artists; uploads without an artist link fall back to the first byline run. */
export function youTubeMusicTracks(data: unknown): YouTubeMusicTrack[] {
  const tracks: YouTubeMusicTrack[] = []
  walk(data, (node) => {
    const row = node.musicResponsiveListItemRenderer as { flexColumns?: { musicResponsiveListItemFlexColumnRenderer?: { text?: { runs?: Run[] } } }[] } | undefined
    if (!row?.flexColumns) return
    const [titleColumn, bylineColumn] = row.flexColumns.map(column => column.musicResponsiveListItemFlexColumnRenderer?.text?.runs ?? [])
    const title = titleColumn?.[0]?.text
    if (!title) return
    const byline = bylineColumn ?? []
    const linked = byline
      .filter(run => JSON.stringify(run.navigationEndpoint ?? '').includes('MUSIC_PAGE_TYPE_ARTIST'))
      .map(run => run.text ?? '')
    tracks.push({ title, artists: (linked.length ? linked : [byline[0]?.text ?? '']).filter(Boolean) })
  })
  return tracks
}

export function youTubeMusicContinuation(data: unknown): string | null {
  let token: string | null = null
  walk(data, (node) => {
    const command = node.continuationCommand as { token?: string } | undefined
    const legacy = node.nextContinuationData as { continuation?: string } | undefined
    token ??= command?.token ?? legacy?.continuation ?? null
  })
  return token
}

export function youTubeMusicTitle(data: unknown, html: string): string {
  let title: string | null = null
  walk(data, (node) => {
    for (const key of ['musicResponsiveHeaderRenderer', 'musicDetailHeaderRenderer', 'musicEditablePlaylistDetailHeaderRenderer']) {
      const header = node[key] as { title?: { runs?: Run[] } } | undefined
      title ??= header?.title?.runs?.[0]?.text ?? null
    }
  })
  return title ?? html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] ?? 'YouTube Music playlist'
}

export async function readYouTubeMusic(listId: string): Promise<{ title: string, tracks: YouTubeMusicTrack[] }> {
  const html = await $fetch<string>(`https://music.youtube.com/playlist?list=${listId}`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en', 'Cookie': CONSENT_COOKIE },
    responseType: 'text',
    timeout: 15_000,
  })
  const { data, clientVersion } = parseYouTubeMusicPage(html)
  const tracks = data ? youTubeMusicTracks(data) : []
  if (!data || tracks.length === 0) {
    throw createError({ statusCode: 502, statusMessage: 'Could not read that YouTube Music playlist. Is it public or unlisted?' })
  }

  let token = youTubeMusicContinuation(data)
  while (token && clientVersion && tracks.length < MAX_TRACKS) {
    const page = await $fetch<unknown>('https://music.youtube.com/youtubei/v1/browse?prettyPrint=false', {
      method: 'POST',
      headers: { 'User-Agent': USER_AGENT, 'Origin': 'https://music.youtube.com', 'Cookie': CONSENT_COOKIE },
      body: { context: { client: { clientName: 'WEB_REMIX', clientVersion, hl: 'en' } }, continuation: token },
      timeout: 15_000,
    }).catch(() => null)
    const more = page ? youTubeMusicTracks(page) : []
    if (more.length === 0) break
    tracks.push(...more)
    token = youTubeMusicContinuation(page)
  }

  return { title: youTubeMusicTitle(data, html), tracks: tracks.slice(0, MAX_TRACKS) }
}

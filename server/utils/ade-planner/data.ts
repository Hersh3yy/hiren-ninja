import type { AdeData, AdeEvent } from '../../types/ade-planner'

// ADE's top-level genres plus the common sub-genres, for events synced before
// ade:sync classified categories into `genres`.
const KNOWN_GENRES = new Set([
  'Hard Dance', 'House', 'Techno', 'Trance', 'Bass & UK', 'Disco, Funk & Soul', 'Electro & Wave',
  'Afro, Latin & Global', 'Ambient & Listening', 'Beyond the Dancefloor', 'Tech-house', 'Deep House',
  'Melodic House', 'Progressive House', 'Afro House', 'Minimal-Techno', 'Melodic Techno', 'Hard Techno',
  'Hardstyle', 'Hard Groove', 'Disco House', 'Organic House',
])

function withDerivedFields(event: AdeEvent): AdeEvent {
  const labels = (event.categories ?? '').split(' / ').map(label => label.trim()).filter(Boolean)
  return {
    ...event,
    genres: event.genres ?? labels.filter(label => KNOWN_GENRES.has(label)),
    ticketStatus: event.ticketStatus ?? (event.soldOut ? 'sold out' : 'unknown'),
  }
}

async function loadFromVams(): Promise<AdeData | null> {
  if (!isVamsConfigured()) return null

  try {
    const [artistEntries, eventEntries] = await Promise.all([
      fetchVamsEntries('ade-artist'),
      fetchVamsEntries('ade-event'),
    ])
    if (artistEntries.length === 0) return null

    return {
      source: 'vams',
      artists: artistEntries.map(({ id, title, content }) => ({
        id,
        name: title,
        country: (content.country as string) ?? null,
        spotifyId: (content.spotifyId as string) ?? null,
        adeUrl: content.adeUrl as string,
        eventIds: (content.events as string[]) ?? [],
      })),
      events: eventEntries.map(({ id, title, content }) => withDerivedFields({
        ...(content as Omit<AdeEvent, 'id' | 'title' | 'lineup'>),
        id,
        title,
        lineup: (content.lineup as string[]) ?? [],
      })),
    }
  } catch (error) {
    console.warn('[ade-planner] VAMS unavailable, using snapshot:', (error as Error).message)
    return null
  }
}

async function loadFromSnapshot(): Promise<AdeData> {
  const snapshot = await useStorage('assets:server').getItem<Omit<AdeData, 'source'>>('ade-planner/snapshot.json')
  if (!snapshot) {
    throw createError({ statusCode: 503, statusMessage: 'ADE data is not available yet.' })
  }
  return { source: 'snapshot', ...snapshot, events: snapshot.events.map(withDerivedFields) }
}

/** The ADE program: VAMS when reachable, otherwise the bundled snapshot. Cached for an hour. */
export const loadAdeData = defineCachedFunction(
  async (): Promise<AdeData> => (await loadFromVams()) ?? loadFromSnapshot(),
  { name: 'ade-planner-data', maxAge: 60 * 60, swr: true },
)

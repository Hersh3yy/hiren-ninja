import type { AdeArtist, AdeData, AdeEvent, AdeVenue } from '../../types/ade-planner'
import { withVenues } from './venues'

// Kind, intent, format, party or daytime: all classified by VAMS on sync (AdeEventClassifier).

async function loadFromVams(): Promise<AdeData | null> {
  if (!isVamsConfigured()) return null

  try {
    const [artistEntries, eventEntries, venueEntries] = await Promise.all([
      fetchVamsEntries('ade-artist'),
      fetchVamsEntries('ade-event'),
      // Optional: without venues the planner still works, just without places.
      fetchVamsEntries('ade-venue').catch(() => []),
    ])
    if (artistEntries.length === 0) return null

    return {
      source: 'vams',
      artists: artistEntries.map(({ id, title, content }) => ({
        id,
        name: title,
        country: (content.country as string) ?? null,
        spotifyId: (content.spotifyId as string) ?? null,
        role: (content.role as AdeArtist['role']) ?? 'artist',
        subtitle: (content.subtitle as string) ?? null,
        adeUrl: content.adeUrl as string,
        eventIds: (content.events as string[]) ?? [],
      })),
      events: eventEntries.map(({ id, title, content }) => ({
        ...(content as Omit<AdeEvent, 'id' | 'title' | 'lineup'>),
        id,
        title,
        lineup: (content.lineup as string[]) ?? [],
      })),
      venues: venueEntries.map(({ title, content }) => ({ name: title, ...(content as Omit<AdeVenue, 'name'>) })),
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
  return { source: 'snapshot', ...snapshot }
}

/** The ADE program: VAMS when reachable, otherwise the bundled snapshot. Cached for an hour. */
export const loadAdeData = defineCachedFunction(
  async (): Promise<AdeData> => withVenues((await loadFromVams()) ?? await loadFromSnapshot()),
  { name: 'ade-planner-data', maxAge: 60 * 60, swr: true },
)

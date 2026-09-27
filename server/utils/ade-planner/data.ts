import type { AdeArtist, AdeData, AdeEvent } from '../../types/ade-planner'

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
      artists: artistEntries.map(({ title, content }) => ({ ...content, id: content.externalId, name: title }) as AdeArtist),
      events: eventEntries.map(({ title, content }) => ({ ...content, id: content.externalId, title }) as AdeEvent),
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
  async (): Promise<AdeData> => (await loadFromVams()) ?? loadFromSnapshot(),
  { name: 'ade-planner-data', maxAge: 60 * 60, swr: true },
)

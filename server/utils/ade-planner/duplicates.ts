import type { AdeData, AdeEvent } from '../../types/ade-planner'

const venueKey = (name: string | null): string => (name ?? '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const titleKey = (title: string): string => venueKey(title)

/** Two organisers can list one show: same start, same venue, same lineup (2+ acts). */
function duplicateKey(event: AdeEvent): string | null {
  if (!event.venue || (event.lineup?.length ?? 0) < 2) return null
  return [event.startsAt, venueKey(event.venue), [...event.lineup].sort().join(',')].join('|')
}

/** The listing to keep: one with a ticket link, then the most stars, then a stable id. */
function primaryFirst(a: AdeEvent, b: AdeEvent): number {
  return Number(Boolean(b.ticketUrl)) - Number(Boolean(a.ticketUrl))
    || (b.favorites ?? 0) - (a.favorites ?? 0)
    || a.id.localeCompare(b.id)
}

function mergedTitle(events: AdeEvent[]): string {
  const [primary, ...rest] = events
  const titles = [primary!.title]
  for (const { title } of rest) {
    // "Vault Sessions x SK_eleven" vs "... | Blast Galaxy" is one name, not two.
    if (!titles.some(kept => titleKey(kept).includes(titleKey(title)) || titleKey(title).includes(titleKey(kept)))) titles.push(title)
  }
  return titles.join(' / ')
}

/**
 * Folds events ADE lists twice (Mystic Garden and Dockyard Festival at Havenpark) into one.
 * The kept event lists the others in `alsoListedAs`; artists point at the kept id, and
 * `aliases` maps a dropped id to it so saved or shared plans still resolve.
 */
export function mergeDuplicateEvents(data: AdeData): AdeData {
  const groups = new Map<string, AdeEvent[]>()
  for (const event of data.events) {
    const key = duplicateKey(event)
    if (key) groups.set(key, [...(groups.get(key) ?? []), event])
  }

  const aliases = new Map<string, string>()
  const merged = new Map<string, AdeEvent>()
  for (const group of groups.values()) {
    if (group.length < 2) continue
    const [primary, ...others] = [...group].sort(primaryFirst)
    for (const other of others) aliases.set(other.id, primary!.id)
    merged.set(primary!.id, {
      ...primary!,
      title: mergedTitle([primary!, ...others]),
      favorites: group.reduce((sum, event) => sum + (event.favorites ?? 0), 0),
      alsoListedAs: others.map(({ id, title, adeUrl, ticketUrl }) => ({ id, title, adeUrl, ticketUrl: ticketUrl ?? null })),
    })
  }
  if (aliases.size === 0) return data

  return {
    ...data,
    events: data.events.filter(event => !aliases.has(event.id)).map(event => merged.get(event.id) ?? event),
    artists: data.artists.map(artist => ({
      ...artist,
      eventIds: [...new Set(artist.eventIds.map(id => aliases.get(id) ?? id))],
    })),
    aliases: Object.fromEntries(aliases),
  }
}

/** An event id as the planner knows it now: a merged-away duplicate resolves to the kept one. */
export function resolveEventId(data: AdeData, id: string): string {
  return data.aliases?.[id] ?? id
}

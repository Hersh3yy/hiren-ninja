import { computed, ref } from 'vue'
import { track } from '../utils/track'

const TIME_ZONE = 'Europe/Amsterdam'
const PLAYLIST_URL = /^https:\/\/(open\.spotify\.com|music\.apple\.com|(music\.|www\.|m\.)?youtube\.com)\//

const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' })
const dayLabel = new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, weekday: 'long', day: 'numeric', month: 'long' })

// Copied lineups tag names: "Bassjackers (NL)", "Kerri Chandler (live)", "X [DJ set]".
// Only after a name, so an act called "[IVY]" stays whole.
const LINEUP_TAG = /\s+(?:\((?:[A-Z]{2,3}|live|dj ?set|hybrid|a\/v)\)|\[(?:live|dj ?set|hybrid|a\/v)\])\s*$/i

/** "a, b\nc" -> [{ name: 'a', weight: 1 }, ...], deduplicated case-insensitively. */
export function parseArtistList(text) {
  const seen = new Set()
  return text
    .split(/[\n,;]+/)
    .map(name => name.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '').replace(LINEUP_TAG, '').trim())
    .filter((name) => {
      const key = name.toLowerCase()
      // Separator lines ("-", "•••") are not names.
      if (!/[\p{L}\p{N}]/u.test(name) || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map(name => ({ name, weight: 1 }))
}

/** One entry per event, listing every matched artist who plays it. */
export function eventsFromMatches(matches) {
  const events = new Map()
  for (const match of matches) {
    for (const event of match.events) {
      const entry = events.get(event.id) ?? { event, artists: [] }
      entry.artists.push(match.artist.name)
      events.set(event.id, entry)
    }
  }
  return [...events.values()]
}

const hourIn = new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, hour: '2-digit', hourCycle: 'h23' })
const NIGHT_ENDS_AT = 6

/** A party starting at 00:30 on Friday is Thursday night, so it belongs under Thursday. */
function planningDate(event) {
  const date = new Date(event.startsAt)
  if (event.isParty !== false && Number(hourIn.format(date)) < NIGHT_ENDS_AT) {
    return new Date(date.getTime() - NIGHT_ENDS_AT * 60 * 60 * 1000)
  }
  return date
}

/** [{ event, artists }] grouped by Amsterdam day (nights until 06:00 count as the day before), sorted by start time. */
export function groupEventsByDay(items) {
  const days = new Map()
  for (const entry of [...items].sort((a, b) => a.event.startsAt.localeCompare(b.event.startsAt))) {
    const date = planningDate(entry.event)
    const key = dayKey.format(date)
    const day = days.get(key) ?? { key, label: dayLabel.format(date), items: [] }
    day.items.push(entry)
    days.set(key, day)
  }
  return [...days.values()]
}

export function groupByDay(matches) {
  return groupEventsByDay(eventsFromMatches(matches))
}

/** Genre -> number of your events, most common first. */
export function genreProfile(items) {
  const counts = new Map()
  for (const { event } of items) {
    for (const genre of event.genres ?? []) counts.set(genre, (counts.get(genre) ?? 0) + 1)
  }
  return [...counts].map(([genre, count]) => ({ genre, count })).sort((a, b) => b.count - a.count)
}

/** "Try an example" input; searches with exactly this text don't count as real interest. */
export const EXAMPLE_INPUT = 'Adam Beyer\nAmelie Lens\nPaul Kalkbrenner\nKerri Chandler\nSomeone Not Playing'

export function useAdePlanner() {
  const input = ref('')
  const isLoading = ref(false)
  const error = ref('')
  const playlist = ref(null)
  const result = ref(null)
  const suggestions = ref([])
  const suggestionsLoading = ref(false)
  const genreFilter = ref('')

  // First line may be a playlist link; any lines after it are extra artist names.
  const firstLine = computed(() => input.value.trim().split('\n')[0].trim())
  const isPlaylistLink = computed(() => PLAYLIST_URL.test(firstLine.value))
  const allMatchedEvents = computed(() => (result.value ? eventsFromMatches(result.value.matches) : []))
  // This tab is for parties; daytime sessions of your artists live in the other tab.
  const matchedEvents = computed(() => allMatchedEvents.value.filter(({ event }) => event.isParty !== false))
  const daytimeEvents = computed(() => allMatchedEvents.value.filter(({ event }) => event.isParty === false))
  const daytimeWithYourArtists = computed(() => daytimeEvents.value.length)
  const daytimeQuery = computed(() => [...new Set(daytimeEvents.value.flatMap(({ artists }) => artists))].join(', '))
  const sound = computed(() => genreProfile(matchedEvents.value))
  const days = computed(() => groupEventsByDay(
    genreFilter.value
      ? matchedEvents.value.filter(({ event }) => event.genres?.includes(genreFilter.value))
      : matchedEvents.value,
  ))
  const artistsWithoutEvents = computed(() => (result.value?.matches ?? []).filter(match => match.events.length === 0))

  async function run() {
    const value = input.value.trim()
    if (!value) return

    isLoading.value = true
    error.value = ''
    playlist.value = null
    result.value = null
    suggestions.value = []
    genreFilter.value = ''

    // A Tidal or SoundCloud link would otherwise be searched as one artist name.
    if (!isPlaylistLink.value && /^https?:\/\//i.test(firstLine.value)) {
      const host = firstLine.value.replace(/^https?:\/\/(?:www\.)?([^/]+).*/i, '$1')
      error.value = `Links from ${host} aren't supported yet. Use a Spotify, Apple Music or YouTube Music playlist, or type artist names.`
      track('ade-search-failed', { input: 'unsupported-link', host })
      isLoading.value = false
      return
    }

    try {
      let artists
      if (isPlaylistLink.value) {
        playlist.value = await $fetch('/api/ade-planner/playlist', { query: { url: firstLine.value } })
        const fromPlaylist = playlist.value.artists.map(artist => ({ name: artist.name, weight: artist.tracks }))
        const known = new Set(fromPlaylist.map(artist => artist.name.toLowerCase()))
        const extra = parseArtistList(value.split('\n').slice(1).join('\n')).filter(artist => !known.has(artist.name.toLowerCase()))
        artists = [...fromPlaylist, ...extra]
      } else {
        artists = parseArtistList(value)
      }

      // What was searched, for the anonymous search log (VAMS ade-search).
      const search = playlist.value
        ? {
            kind: 'playlist',
            source: playlist.value.source,
            playlistUrl: firstLine.value,
            playlistTitle: playlist.value.title,
            trackCount: playlist.value.trackCount,
            partial: Boolean(playlist.value.partial),
            query: value.split('\n').slice(1).join('\n').trim() || undefined
          }
        : { kind: 'names', source: 'names', query: value, example: value === EXAMPLE_INPUT }

      result.value = await $fetch('/api/ade-planner/match', { method: 'POST', body: { artists, search } })
      track('ade-search', {
        input: playlist.value?.source ?? 'names',
        artists: artists.length,
        matches: result.value.matches.length,
        events: allMatchedEvents.value.length,
        partial: Boolean(playlist.value?.partial)
      })
      loadSuggestions(artists)
    } catch (err) {
      error.value = err?.data?.statusMessage || err?.statusMessage || 'Something went wrong. Try again.'
      track('ade-search-failed', { input: isPlaylistLink.value ? 'playlist' : 'names', status: err?.statusCode ?? err?.status ?? 0 })
    } finally {
      isLoading.value = false
    }
  }

  // Your matched artists seed first: their related artists are the likeliest to play ADE.
  async function loadSuggestions(artists) {
    const matchedNames = new Set(result.value.matches.map(match => match.query))
    const seeds = [
      ...artists.filter(artist => matchedNames.has(artist.name)).map(artist => ({ ...artist, weight: artist.weight + 1000 })),
      ...artists.filter(artist => !matchedNames.has(artist.name)),
    ]
    suggestionsLoading.value = true
    try {
      suggestions.value = await $fetch('/api/ade-planner/suggestions', {
        method: 'POST',
        body: { artists: seeds, matchedArtistIds: result.value.matches.map(match => match.artist.id) },
      })
      track('ade-suggestions', { artists: suggestions.value.length })
    } catch {
      suggestions.value = []
    } finally {
      suggestionsLoading.value = false
    }
  }

  return {
    input, isLoading, error, playlist, result, days, sound, genreFilter,
    suggestions, suggestionsLoading, artistsWithoutEvents, isPlaylistLink, run,
    daytimeWithYourArtists, daytimeQuery,
  }
}

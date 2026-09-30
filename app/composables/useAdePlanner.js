import { computed, ref } from 'vue'

const TIME_ZONE = 'Europe/Amsterdam'
const PLAYLIST_URL = /^https:\/\/(open\.spotify\.com|music\.apple\.com|(music\.|www\.|m\.)?youtube\.com)\//

const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' })
const dayLabel = new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, weekday: 'long', day: 'numeric', month: 'long' })

/** "a, b\nc" -> [{ name: 'a', weight: 1 }, ...], deduplicated case-insensitively. */
export function parseArtistList(text) {
  const seen = new Set()
  return text
    .split(/[\n,;]+/)
    .map(name => name.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '').trim())
    .filter((name) => {
      const key = name.toLowerCase()
      if (!name || seen.has(key)) return false
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

export function useAdePlanner() {
  const input = ref('')
  const isLoading = ref(false)
  const error = ref('')
  const playlist = ref(null)
  const result = ref(null)
  const suggestions = ref([])
  const suggestionsLoading = ref(false)
  const genreFilter = ref('')

  const isPlaylistLink = computed(() => PLAYLIST_URL.test(input.value.trim()))
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

    try {
      let artists
      if (isPlaylistLink.value) {
        playlist.value = await $fetch('/api/ade-planner/playlist', { query: { url: value } })
        artists = playlist.value.artists.map(artist => ({ name: artist.name, weight: artist.tracks }))
      } else {
        artists = parseArtistList(value)
      }

      result.value = await $fetch('/api/ade-planner/match', { method: 'POST', body: { artists } })
      loadSuggestions(artists)
    } catch (err) {
      error.value = err?.data?.statusMessage || err?.statusMessage || 'Something went wrong. Try again.'
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

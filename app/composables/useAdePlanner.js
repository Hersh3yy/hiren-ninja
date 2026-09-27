import { computed, ref } from 'vue'

const TIME_ZONE = 'Europe/Amsterdam'
const PLAYLIST_URL = /^https:\/\/(open\.spotify\.com|music\.apple\.com)\//

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

/** One entry per event, listing every matched artist who plays it, grouped by Amsterdam day. */
export function groupByDay(matches) {
  const events = new Map()
  for (const match of matches) {
    for (const event of match.events) {
      const entry = events.get(event.id) ?? { event, artists: [] }
      entry.artists.push(match.artist.name)
      events.set(event.id, entry)
    }
  }

  const days = new Map()
  for (const entry of [...events.values()].sort((a, b) => a.event.startsAt.localeCompare(b.event.startsAt))) {
    const date = new Date(entry.event.startsAt)
    const key = dayKey.format(date)
    const day = days.get(key) ?? { key, label: dayLabel.format(date), items: [] }
    day.items.push(entry)
    days.set(key, day)
  }
  return [...days.values()]
}

export function useAdePlanner() {
  const input = ref('')
  const isLoading = ref(false)
  const error = ref('')
  const playlist = ref(null)
  const result = ref(null)

  const isPlaylistLink = computed(() => PLAYLIST_URL.test(input.value.trim()))
  const days = computed(() => (result.value ? groupByDay(result.value.matches) : []))
  const artistsWithoutEvents = computed(() => (result.value?.matches ?? []).filter(match => match.events.length === 0))

  async function run() {
    const value = input.value.trim()
    if (!value) return

    isLoading.value = true
    error.value = ''
    playlist.value = null
    result.value = null

    try {
      let artists
      if (isPlaylistLink.value) {
        playlist.value = await $fetch('/api/ade-planner/playlist', { query: { url: value } })
        artists = playlist.value.artists.map(artist => ({ name: artist.name, weight: artist.tracks }))
      } else {
        artists = parseArtistList(value)
      }

      result.value = await $fetch('/api/ade-planner/match', { method: 'POST', body: { artists } })
    } catch (err) {
      error.value = err?.data?.statusMessage || err?.statusMessage || 'Something went wrong. Try again.'
    } finally {
      isLoading.value = false
    }
  }

  return { input, isLoading, error, playlist, result, days, artistsWithoutEvents, isPlaylistLink, run }
}

import { computed, ref } from 'vue'
import { track } from '../utils/track'

const STORAGE_KEY = 'ade-planner:favorites'

// One shared list per tab; favorites live only in this browser.
const favorites = ref([])
let loaded = false

function load() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
    favorites.value = Array.isArray(stored) ? stored : []
  } catch {
    favorites.value = []
  }
}

function save() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites.value))
  } catch {
    // Private mode or full storage: favorites still work for this visit.
  }
}

/** The fields a saved event needs to render without re-running a match. */
function snapshotOf(event, artists) {
  const {
    id, title, subtitle, startsAt, endsAt, venue, address, area, adeUrl, ticketUrl, ticketLabel, ticketStatus,
    genres, kinds, lineupNames, program, isParty, timeOfDay, format, durationMinutes, seriesDates
  } = event
  return {
    id, title, subtitle, startsAt, endsAt, venue, address, area, adeUrl, ticketUrl, ticketLabel, ticketStatus,
    genres, kinds, lineupNames, program, isParty, timeOfDay, format, durationMinutes, seriesDates, artists
  }
}

export function useAdeFavorites() {
  load()

  const favoriteIds = computed(() => new Set(favorites.value.map(favorite => favorite.id)))

  function isFavorite(eventId) {
    return favoriteIds.value.has(eventId)
  }

  function toggleFavorite(event, artists = []) {
    track('ade-favorite', { action: isFavorite(event.id) ? 'remove' : 'add', party: event.isParty !== false, pro: event.program === 'pro' })
    favorites.value = isFavorite(event.id)
      ? favorites.value.filter(favorite => favorite.id !== event.id)
      : [...favorites.value, snapshotOf(event, artists)]
    save()
  }

  return { favorites, isFavorite, toggleFavorite }
}

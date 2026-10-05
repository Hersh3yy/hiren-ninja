import { computed, reactive, ref, watch } from 'vue'
import { track } from '../utils/track'

export const KIND_LABELS = {
  talks: 'Talks & panels',
  interviews: 'Interviews & Q&As',
  masterclasses: 'Masterclasses & workshops',
  'meet-the': 'Meet the… sessions',
  gear: 'Demos & gear',
  listening: 'Listening sessions',
  showcases: 'Showcases & expos',
  instore: 'Record stores & meet-and-greets',
  networking: 'Networking & drinks',
  art: 'Exhibitions & AV art',
  film: 'Film',
  performances: 'Live performances',
  wellbeing: 'Wellbeing & sports',
  culture: 'Music culture'
}

export const TIME_LABELS = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  night: 'Late',
  'all-day': 'All day',
  tba: 'Time TBA'
}

export const ACCESS_LABELS = { free: 'Free', ticket: 'Ticket', pro: 'ADE Pro pass' }

// Kinds and days sit on the page itself; the drawer holds the rest.
export const FILTER_GROUPS = [
  { key: 'kinds', label: 'Kind', labels: KIND_LABELS, onPage: true },
  { key: 'times', label: 'Time of day', labels: TIME_LABELS },
  { key: 'access', label: 'Price', labels: ACCESS_LABELS },
  { key: 'areas', label: 'Area', labels: null },
  { key: 'genres', label: 'Genre', labels: null }
]

const dayName = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', weekday: 'short' })

export const DRAWER_GROUPS = FILTER_GROUPS.filter(group => !group.onPage)

export function labelFor(groupKey, value) {
  return FILTER_GROUPS.find(group => group.key === groupKey)?.labels?.[value] ?? value
}

export function useDaytimeBrowse(initialQuery = '') {
  const q = ref(initialQuery)
  const day = ref('')
  const filters = reactive({ kinds: [], times: [], access: [], areas: [], genres: [] })
  const result = ref({ total: 0, sessions: [], dropIns: [], tba: [], days: [], facets: {}, partyArtists: [], partyGenres: [], didYouMean: [] })
  // True until the first answer arrives, so the empty state never flashes on load.
  const isLoading = ref(true)
  let latestRequest = 0
  let ready = false
  const error = ref('')

  const dayTabs = computed(() => result.value.days.map(({ value, count }) => ({
    id: value,
    label: dayName.format(new Date(`${value}T12:00:00+02:00`)),
    count
  })))

  // Drawer filters only: kinds already show as pressed chips on the page.
  const activeFilters = computed(() => DRAWER_GROUPS.flatMap(group =>
    filters[group.key].map(value => ({ group: group.key, value, label: labelFor(group.key, value) }))
  ))

  /** @param {{ log?: boolean }} [options] log: a submitted search, for the anonymous search log */
  async function load({ log = false } = {}) {
    const request = ++latestRequest
    isLoading.value = true
    error.value = ''
    try {
      const response = await $fetch('/api/ade-planner/browse', {
        query: {
          q: q.value.trim() || undefined,
          day: day.value || undefined,
          log: log ? '1' : undefined,
          ...Object.fromEntries(FILTER_GROUPS.map(group => [group.key, filters[group.key].join(',') || undefined]))
        }
      })
      // A slower, older request must not overwrite a newer answer.
      if (request !== latestRequest) return
      result.value = response
      // First load: open on the first day that has something.
      if (!day.value && response.days.length) {
        day.value = response.days[0].value
      } else if (log && !response.total && response.days.length) {
        // A search with nothing on this day but something on another: go there.
        day.value = response.days[0].value
      }
    } catch {
      if (request === latestRequest) error.value = 'Could not load daytime events. Try again.'
    } finally {
      if (request === latestRequest) isLoading.value = false
    }
  }

  function toggle(groupKey, value) {
    const list = filters[groupKey]
    if (!list.includes(value)) track('ade-filter', { group: groupKey, value })
    filters[groupKey] = list.includes(value) ? list.filter(item => item !== value) : [...list, value]
  }

  function clearFilters() {
    for (const group of DRAWER_GROUPS) filters[group.key] = []
  }

  async function init() {
    await load()
    ready = true
    // The first answer picks the opening day; now load just that day.
    if (day.value) await load()
  }

  watch([filters, day], () => {
    if (ready) load()
  }, { deep: true })

  return {
    q, day, filters, result, isLoading, error, dayTabs, activeFilters,
    load, init, toggle, clearFilters
  }
}

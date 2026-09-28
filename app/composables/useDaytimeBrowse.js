import { computed, reactive, ref, watch } from 'vue'

const PAGE = 20

export const KIND_LABELS = {
  talks: 'Talks & panels',
  masterclasses: 'Masterclasses & workshops',
  gear: 'Gear & demos',
  listening: 'Listening sessions',
  showcases: 'Showcases & expos',
  instore: 'Record stores & meet-and-greets',
  networking: 'Networking & meetups',
  art: 'Exhibitions & AV art',
  film: 'Film',
  wellbeing: 'Wellbeing & sports',
  culture: 'Music culture'
}

export const TIME_LABELS = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  night: 'Late',
  'all-day': 'All day'
}

export const ACCESS_LABELS = { free: 'Free', ticket: 'Ticket', pro: 'ADE Pro pass' }

export const FILTER_GROUPS = [
  { key: 'kinds', label: 'Kind', labels: KIND_LABELS },
  { key: 'times', label: 'Time of day', labels: TIME_LABELS },
  { key: 'access', label: 'Price', labels: ACCESS_LABELS },
  { key: 'areas', label: 'Area', labels: null },
  { key: 'genres', label: 'Genre', labels: null }
]

export function labelFor(groupKey, value) {
  return FILTER_GROUPS.find(group => group.key === groupKey)?.labels?.[value] ?? value
}

export function useDaytimeBrowse(initialQuery = '') {
  const q = ref(initialQuery)
  const filters = reactive({ kinds: [], times: [], access: [], areas: [], genres: [] })
  const events = ref([])
  const facets = ref({ kinds: [], times: [], access: [], areas: [], genres: [] })
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref('')

  const activeFilters = computed(() => FILTER_GROUPS.flatMap(group =>
    filters[group.key].map(value => ({ group: group.key, value, label: labelFor(group.key, value) }))
  ))

  function params(offset) {
    return {
      q: q.value.trim() || undefined,
      ...Object.fromEntries(FILTER_GROUPS.map(group => [group.key, filters[group.key].join(',') || undefined])),
      offset,
      limit: PAGE
    }
  }

  async function load({ append = false } = {}) {
    isLoading.value = true
    error.value = ''
    try {
      const result = await $fetch('/api/ade-planner/browse', { query: params(append ? events.value.length : 0) })
      events.value = append ? [...events.value, ...result.events] : result.events
      facets.value = result.facets
      total.value = result.total
    } catch {
      error.value = 'Could not load daytime events. Try again.'
    } finally {
      isLoading.value = false
    }
  }

  function toggle(groupKey, value) {
    const list = filters[groupKey]
    filters[groupKey] = list.includes(value) ? list.filter(item => item !== value) : [...list, value]
  }

  function clearFilters() {
    for (const group of FILTER_GROUPS) filters[group.key] = []
  }

  watch(filters, () => load(), { deep: true })

  return { q, filters, events, facets, total, isLoading, error, activeFilters, load, toggle, clearFilters }
}

import { computed, reactive, ref, watch } from 'vue'

export const INTENT_LABELS = {
  learn: 'Learn',
  meet: 'Meet',
  listen: 'Listen & watch',
  recharge: 'Recharge',
  other: 'Other'
}

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
  'all-day': 'All day',
  tba: 'Time TBA'
}

export const ACCESS_LABELS = { free: 'Free', ticket: 'Ticket', pro: 'ADE Pro pass' }

// The drawer holds the detail; intents and days sit on the page itself.
export const FILTER_GROUPS = [
  { key: 'kinds', label: 'Kind', labels: KIND_LABELS },
  { key: 'times', label: 'Time of day', labels: TIME_LABELS },
  { key: 'access', label: 'Price', labels: ACCESS_LABELS },
  { key: 'areas', label: 'Area', labels: null },
  { key: 'genres', label: 'Genre', labels: null }
]

const PRO_KEY = 'ade-planner:pro-pass'
const dayName = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', weekday: 'short' })

export function labelFor(groupKey, value) {
  return FILTER_GROUPS.find(group => group.key === groupKey)?.labels?.[value] ?? value
}

function readProPass() {
  try {
    return window.localStorage.getItem(PRO_KEY) === '1'
  } catch {
    return false
  }
}

export function useDaytimeBrowse(initialQuery = '') {
  const q = ref(initialQuery)
  const day = ref('')
  const hasProPass = ref(false)
  const intents = ref([])
  const filters = reactive({ kinds: [], times: [], access: [], areas: [], genres: [] })
  const result = ref({ total: 0, sessions: [], dropIns: [], tba: [], days: [], facets: {} })
  const isLoading = ref(false)
  const error = ref('')

  const dayTabs = computed(() => result.value.days.map(({ value, count }) => ({
    id: value,
    label: dayName.format(new Date(`${value}T12:00:00+02:00`)),
    count
  })))

  const activeFilters = computed(() => FILTER_GROUPS.flatMap(group =>
    filters[group.key].map(value => ({ group: group.key, value, label: labelFor(group.key, value) }))
  ))

  async function load() {
    isLoading.value = true
    error.value = ''
    try {
      result.value = await $fetch('/api/ade-planner/browse', {
        query: {
          q: q.value.trim() || undefined,
          day: day.value || undefined,
          pro: hasProPass.value ? '1' : undefined,
          intents: intents.value.join(',') || undefined,
          ...Object.fromEntries(FILTER_GROUPS.map(group => [group.key, filters[group.key].join(',') || undefined]))
        }
      })
      // First load: open on the first day that has something.
      if (!day.value && result.value.days.length) {
        day.value = result.value.days[0].value
      }
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

  function toggleIntent(value) {
    intents.value = intents.value.includes(value) ? intents.value.filter(item => item !== value) : [...intents.value, value]
  }

  function clearFilters() {
    for (const group of FILTER_GROUPS) filters[group.key] = []
  }

  function setProPass(value) {
    hasProPass.value = value
    try {
      window.localStorage.setItem(PRO_KEY, value ? '1' : '0')
    } catch {
      // Remembered for this visit only.
    }
  }

  function init() {
    hasProPass.value = readProPass()
    return load()
  }

  watch([filters, intents, day, hasProPass], () => load(), { deep: true })

  return {
    q, day, hasProPass, intents, filters, result, isLoading, error, dayTabs, activeFilters,
    load, init, toggle, toggleIntent, clearFilters, setProPass
  }
}

import { computed, reactive, ref } from 'vue'
import { track } from '../utils/track'

const TIME_ZONE = 'Europe/Amsterdam'
// ADE 2026 ends on Sunday; after that there is nothing to pick.
const ADE_LAST_DAY = '2026-10-25'

const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' })
const weekday = new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, weekday: 'short', day: 'numeric' })

export const PERIOD_OPTIONS = [
  { value: 'daytime', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'late', label: 'Late night' }
]

export const AREA_OPTIONS = [
  { value: 'west', label: 'West' },
  { value: 'centre', label: 'Centre' },
  { value: 'north', label: 'North' },
  { value: 'east', label: 'East' },
  { value: 'south', label: 'South' },
  { value: 'south-east', label: 'Zuidoost' },
  { value: 'harbour', label: 'Harbour' }
]

export const WHAT_OPTIONS = [
  // Parties only since 23 Oct: the daytime programme (talks, Lab, demos) is over.
  { value: 'parties', label: 'Parties' }
]

export const BUDGET_OPTIONS = [
  { value: 'free', label: 'Free' },
  { value: '25', label: 'Under €25' },
  { value: '50', label: 'Under €50' }
]

export const EXAMPLES = [
  'House in West tomorrow',
  'Techno tonight from 10pm, something free',
  'Silva Bumpa'
]

/** Today, tomorrow, then each remaining ADE day: [{ value: 'YYYY-MM-DD', label }]. */
export function dayOptions(now = new Date()) {
  const options = []
  for (let offset = 0; offset < 5; offset++) {
    const date = new Date(now.getTime() + offset * 86_400_000)
    const value = ymd.format(date)
    if (value > ADE_LAST_DAY) break
    options.push({ value, label: offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : weekday.format(date) })
  }
  if (options.length) options.push({ value: 'all', label: 'All days' })
  return options
}

/**
 * Ask for events by typing what you want, picking filters, or both.
 * `limit` asks for a longer list (Schedule mode); `onRoute` gets a playlist link or artist
 * names the server says belong in Your artists.
 */
export function useAdeAsk({ limit = 0, onRoute = null, source = 'ask' } = {}) {
  const prompt = ref('')
  const filters = reactive({ day: '', q: '', period: '', areas: [], what: [], budget: '' })
  const isLoading = ref(false)
  const error = ref('')
  const result = ref(null)

  const activeFilters = computed(() => [filters.day, filters.q.trim(), filters.period, filters.budget].filter(Boolean).length + filters.areas.length + filters.what.length)
  const canSend = computed(() => Boolean(prompt.value.trim()) || activeFilters.value > 0)

  // A tap while a search runs searches again when it's done, so the list matches the chips.
  let again = false

  async function run() {
    if (!canSend.value) return
    if (isLoading.value) {
      again = true
      return
    }
    isLoading.value = true
    error.value = ''
    const kind = prompt.value.trim() && activeFilters.value ? 'both' : prompt.value.trim() ? 'prompt' : 'filters'
    track(`ade-${source}-search`, { kind })
    try {
      result.value = await $fetch('/api/ade-planner/ask', {
        method: 'POST',
        body: {
          limit: limit || undefined,
          prompt: prompt.value.trim(),
          filters: {
            day: filters.day || undefined,
            q: filters.q.trim() || undefined,
            period: filters.period || undefined,
            areas: filters.areas,
            what: filters.what,
            budget: filters.budget || undefined
          }
        }
      })
      if (result.value.route === 'artists') {
        track(`ade-${source}-result`, { result: 'artists' })
        onRoute?.(result.value.input)
        result.value = null
        return
      }
      const empty = result.value.groups.every(group => group.items.length === 0)
      track(`ade-${source}-result`, { result: result.value.unclear ? 'unclear' : empty ? 'empty' : result.value.source })
    } catch (caught) {
      result.value = null
      error.value = caught?.statusCode === 429
        ? 'Too many searches in a row. Give it a minute.'
        : caught?.statusCode === 400
          ? 'Type what you are after, or pick a day, place or kind of event.'
          : 'Could not search right now. Try again in a moment.'
      track(`ade-${source}-result`, { result: 'error' })
    } finally {
      isLoading.value = false
      if (again) {
        again = false
        run()
      }
    }
  }

  function useExample(text) {
    prompt.value = text
    track('ade-ask-example', { action: 'use' })
    return run()
  }

  function clear() {
    prompt.value = ''
    Object.assign(filters, { day: '', q: '', period: '', areas: [], what: [], budget: '' })
    result.value = null
    error.value = ''
  }

  return { prompt, filters, isLoading, error, result, activeFilters, canSend, run, useExample, clear }
}

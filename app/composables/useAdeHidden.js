import { computed, ref } from 'vue'
import { track } from '../utils/track'

const STORAGE_KEY = 'ade-planner:hidden'

// Events you marked "not interested"; kept per browser, like favorites.
const hiddenIds = ref([])
let loaded = false

function load() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
    hiddenIds.value = Array.isArray(stored) ? stored : []
  } catch {
    hiddenIds.value = []
  }
}

function save() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(hiddenIds.value))
  } catch {
    // Private mode or full storage: hiding still works for this visit.
  }
}

export function useAdeHidden() {
  load()

  const hiddenSet = computed(() => new Set(hiddenIds.value))

  function isHidden(id) {
    return hiddenSet.value.has(id)
  }

  function toggleHidden(id) {
    if (!isHidden(id)) track('ade-hide')
    hiddenIds.value = isHidden(id) ? hiddenIds.value.filter(existing => existing !== id) : [...hiddenIds.value, id]
    save()
  }

  return { hiddenIds, isHidden, toggleHidden }
}

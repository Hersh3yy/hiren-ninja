<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        :aria-expanded="open"
        aria-controls="ade-filters"
        class="rounded-full border px-4 py-1.5 text-sm font-bold uppercase tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        :class="open || active.length ? 'border-accent text-accent' : 'border-border-default text-content hover:border-accent-muted'"
        @click="open = !open"
      >
        Filters{{ active.length ? ` (${active.length})` : '' }}
      </button>

      <button
        v-for="chip in active.slice(0, MAX_CHIPS)"
        :key="`${chip.group}:${chip.value}`"
        type="button"
        class="rounded-full bg-accent px-3 py-1 text-sm font-bold text-ink"
        :aria-label="`Remove filter ${chip.label}`"
        @click="$emit('toggle', chip.group, chip.value)"
      >
        {{ chip.label }} ✕
      </button>
      <span v-if="active.length > MAX_CHIPS" class="text-sm text-content-muted">+{{ active.length - MAX_CHIPS }} more</span>
      <button v-if="active.length" type="button" class="text-sm text-content-muted underline underline-offset-2 hover:text-content" @click="$emit('clear')">
        Clear
      </button>
    </div>

    <div v-if="open" id="ade-filters" class="space-y-4 rounded-xl border border-border-subtle bg-surface p-4">
      <fieldset v-for="group in groups" :key="group.key">
        <legend class="mb-2 text-xs font-bold uppercase tracking-widest text-content-muted">{{ group.label }}</legend>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in visibleOptions(group)"
            :key="option.value"
            type="button"
            :aria-pressed="isOn(group.key, option.value)"
            class="rounded-full border px-3 py-1 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            :class="isOn(group.key, option.value) ? 'border-accent bg-accent text-ink font-bold' : 'border-border-default text-content hover:border-accent-muted'"
            @click="$emit('toggle', group.key, option.value)"
          >
            {{ labelFor(group.key, option.value) }} <span class="opacity-60">{{ option.count }}</span>
          </button>
          <button
            v-if="(facets[group.key] || []).length > LIMIT && !expanded[group.key]"
            type="button"
            class="text-sm text-content-muted underline underline-offset-2"
            @click="expanded[group.key] = true"
          >
            All {{ group.label.toLowerCase() }}
          </button>
        </div>
      </fieldset>
    </div>
  </div>
</template>

<script setup>
import { FILTER_GROUPS, labelFor } from '~/composables/useDaytimeBrowse.js'

const props = defineProps({
  filters: { type: Object, required: true },
  facets: { type: Object, required: true },
  active: { type: Array, default: () => [] }
})

defineEmits(['toggle', 'clear'])

const MAX_CHIPS = 3
const LIMIT = 8

const open = ref(false)
const expanded = reactive({})
const groups = FILTER_GROUPS

function isOn(groupKey, value) {
  return props.filters[groupKey].includes(value)
}

// Keep selected options visible even when they fall outside the first few.
function visibleOptions(group) {
  const options = props.facets[group.key] || []
  if (expanded[group.key]) return options
  const top = options.slice(0, LIMIT)
  const selected = options.filter(option => isOn(group.key, option.value) && !top.includes(option))
  return [...top, ...selected]
}
</script>

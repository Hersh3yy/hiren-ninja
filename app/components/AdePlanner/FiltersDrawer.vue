<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center gap-2">
      <AtomsChip
        :text="active.length ? `Filters (${active.length})` : 'Filters'"
        :pressed="open"
        :aria-expanded="open"
        aria-controls="ade-filters"
        @click="open = !open"
      />

      <AtomsChip
        v-for="chip in active.slice(0, MAX_CHIPS)"
        :key="`${chip.group}:${chip.value}`"
        size="sm"
        removable
        :text="chip.label"
        :aria-label="`Remove filter ${chip.label}`"
        @click="$emit('toggle', chip.group, chip.value)"
      />
      <span v-if="active.length > MAX_CHIPS" class="text-sm text-content-muted">+{{ active.length - MAX_CHIPS }} more</span>
      <AtomsButton v-if="active.length" variant="link-muted" class="text-sm" text="Clear" @click="$emit('clear')" />
    </div>

    <div v-if="open" id="ade-filters" class="space-y-4 rounded-xl border border-border-subtle bg-surface p-4">
      <fieldset v-for="group in groups" :key="group.key">
        <legend class="mb-2 text-xs font-bold uppercase tracking-widest text-content-muted">{{ group.label }}</legend>
        <div class="flex flex-wrap gap-2">
          <AtomsChip
            v-for="option in visibleOptions(group)"
            :key="option.value"
            size="sm"
            :text="labelFor(group.key, option.value)"
            :count="option.count"
            :pressed="isOn(group.key, option.value)"
            @click="$emit('toggle', group.key, option.value)"
          />
          <AtomsButton
            v-if="(facets[group.key] || []).length > LIMIT && !expanded[group.key]"
            variant="link-muted"
            class="text-sm"
            :text="`All ${group.label.toLowerCase()}`"
            @click="expanded[group.key] = true"
          />
        </div>
      </fieldset>
    </div>
  </div>
</template>

<script setup>
import { DRAWER_GROUPS, labelFor } from '~/composables/useDaytimeBrowse.js'

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
const groups = DRAWER_GROUPS

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

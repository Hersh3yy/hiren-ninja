<template>
  <div class="space-y-2">
    <p class="text-sm text-content-muted">
      Just here for the vibe? Free nights, or a cheap ticket where the shop shows its price.
    </p>
    <div class="flex flex-wrap gap-2" role="group" aria-label="Filter by ticket price">
      <AtomsChip
        v-for="option in BUDGETS"
        :key="option.value"
        size="sm"
        :text="option.label"
        :count="counts[option.value] ?? 0"
        :pressed="modelValue === option.value"
        @click="choose(option.value)"
      />
    </div>
    <p v-if="modelValue && modelValue !== 'free'" class="text-xs text-content-muted">
      Prices come from Weeztix and Resident Advisor ticket shops (lowest ticket on sale), so parties sold elsewhere don't show here.
    </p>
  </div>
</template>

<script setup>
import { BUDGETS } from '../../../server/utils/ade-planner/price'
import { track } from '~/utils/track'

const props = defineProps({
  modelValue: { type: String, default: '' },
  /** budget value -> number of your events within it */
  counts: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue'])

function choose(value) {
  const next = props.modelValue === value ? '' : value
  if (next) track('ade-budget', { budget: next, results: props.counts[next] ?? 0 })
  emit('update:modelValue', next)
}
</script>

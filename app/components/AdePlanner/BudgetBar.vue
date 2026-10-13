<template>
  <div class="space-y-2">
    <p class="text-sm text-content-muted">
      On a budget? Free parties, or the cheapest ticket on sale where the shop shows it.
    </p>
    <div class="flex flex-wrap gap-2" role="group" aria-label="Filter by ticket price">
      <AtomsChip
        v-for="option in BUDGETS"
        :key="option.value"
        size="sm"
        :text="option.label"
        :count="counts[option.value] ?? 0"
        :pressed="modelValue === option.value"
        @click="$emit('update:modelValue', modelValue === option.value ? '' : option.value)"
      />
    </div>
    <p v-if="modelValue && modelValue !== 'free'" class="text-xs text-content-muted">
      Prices come from Weeztix and Resident Advisor ticket shops (lowest ticket on sale), so parties sold elsewhere don't show here.
    </p>
  </div>
</template>

<script setup>
import { BUDGETS } from '../../../server/utils/ade-planner/price'

defineProps({
  modelValue: { type: String, default: '' },
  /** budget value -> number of your events within it */
  counts: { type: Object, default: () => ({}) }
})

defineEmits(['update:modelValue'])
</script>

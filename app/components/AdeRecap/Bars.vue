<template>
  <ol class="space-y-1.5">
    <li v-for="(item, i) in items" :key="item.label" class="grid grid-cols-[1.5rem_minmax(0,9rem)_minmax(0,1fr)_2.5rem] items-center gap-2 text-sm sm:grid-cols-[1.5rem_minmax(0,12rem)_minmax(0,1fr)_2.5rem]">
      <span class="text-right font-mono text-xs text-content-muted">{{ i + 1 }}</span>
      <span class="truncate" :class="item.highlight ? 'font-bold text-accent' : 'text-content'" :title="item.label">{{ item.label }}</span>
      <span class="h-2.5 overflow-hidden rounded-r-[4px] bg-elevated" aria-hidden="true">
        <span class="block h-full rounded-r-[4px] bg-accent/80" :style="{ width: `${Math.max(2, (item.value / max) * 100)}%` }" />
      </span>
      <span class="text-right font-mono text-xs text-content">{{ item.value }}</span>
    </li>
  </ol>
</template>

<script setup>
// A ranked list with a bar per row; the number is always written out (no hover needed).
const props = defineProps({
  /** [{ label, value, highlight? }] */
  items: { type: Array, required: true }
})
const max = computed(() => Math.max(1, ...props.items.map(item => item.value)))
</script>

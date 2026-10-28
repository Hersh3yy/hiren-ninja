<template>
  <figure class="space-y-2">
    <div class="flex h-44 items-end gap-[2px] pt-6" role="img" :aria-label="label">
      <div
        v-for="(item, i) in items"
        :key="item.key"
        class="group relative flex h-full min-w-0 flex-1 items-end"
        tabindex="0"
        :aria-label="`${item.label}: ${item.value}`"
      >
        <div class="w-full rounded-t-[4px] bg-accent transition-opacity group-hover:opacity-100 group-focus:opacity-100" :class="highlight === i ? 'opacity-100' : 'opacity-75'" :style="{ height: `${Math.max(2, (item.value / max) * 100)}%` }" />
        <!-- Tooltip: hover or keyboard focus -->
        <span class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-sm border border-border-default bg-elevated px-2 py-1 text-xs text-content shadow-lg group-hover:block group-focus:block">
          {{ item.label }} · <strong>{{ item.value.toLocaleString('en-GB') }}</strong>
        </span>
      </div>
    </div>
    <div class="flex justify-between text-[11px] text-content-muted">
      <span v-for="tick in ticks" :key="tick">{{ tick }}</span>
    </div>
    <figcaption v-if="caption" class="text-xs text-content-muted">{{ caption }}</figcaption>
  </figure>
</template>

<script setup>
// One series as columns, 2px apart, hover or focus a column for its value.
const props = defineProps({
  /** [{ key, label, value }] */
  items: { type: Array, required: true },
  label: { type: String, required: true },
  ticks: { type: Array, default: () => [] },
  caption: { type: String, default: '' },
  /** index to show at full strength (e.g. the peak) */
  highlight: { type: Number, default: -1 }
})
const max = computed(() => Math.max(1, ...props.items.map(item => item.value)))
</script>

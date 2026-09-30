<template>
  <div role="tablist" :aria-label="label" class="flex w-full gap-1 rounded-full border border-border-default p-1 sm:inline-flex sm:w-auto">
    <button
      v-for="item in items"
      :id="`${idPrefix}-tab-${item.id}`"
      :key="item.id"
      type="button"
      role="tab"
      :aria-selected="modelValue === item.id"
      :aria-controls="controlsPanels ? `${idPrefix}-panel-${item.id}` : undefined"
      class="min-w-0 flex-1 whitespace-nowrap rounded-full px-2 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:flex-none sm:px-4 sm:text-sm"
      :class="modelValue === item.id ? 'bg-accent text-ink' : 'text-content-muted hover:text-content'"
      @click="$emit('update:modelValue', item.id)"
    >
      <span v-if="item.shortLabel" class="sm:hidden">{{ item.shortLabel }}</span>
      <span :class="item.shortLabel ? 'hidden sm:inline' : ''">{{ item.label }}</span><span v-if="item.count != null" class="ml-1 opacity-60">{{ item.count }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, required: true },
  modelValue: { type: String, required: true },
  label: { type: String, required: true },
  idPrefix: { type: String, required: true },
  // Only true when each tab has its own panel with id `${idPrefix}-panel-${id}`.
  controlsPanels: { type: Boolean, default: true }
})

defineEmits(['update:modelValue'])
</script>

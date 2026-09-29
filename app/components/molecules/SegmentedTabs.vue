<template>
  <div role="tablist" :aria-label="label" class="inline-flex flex-wrap gap-1 rounded-full border border-border-default p-1">
    <button
      v-for="item in items"
      :id="`${idPrefix}-tab-${item.id}`"
      :key="item.id"
      type="button"
      role="tab"
      :aria-selected="modelValue === item.id"
      :aria-controls="`${idPrefix}-panel-${item.id}`"
      class="rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      :class="modelValue === item.id ? 'bg-accent text-ink' : 'text-content-muted hover:text-content'"
      @click="$emit('update:modelValue', item.id)"
    >
      {{ item.label }}<span v-if="item.count != null" class="ml-1 opacity-60">{{ item.count }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, required: true },
  modelValue: { type: String, required: true },
  label: { type: String, required: true },
  idPrefix: { type: String, required: true }
})

defineEmits(['update:modelValue'])
</script>

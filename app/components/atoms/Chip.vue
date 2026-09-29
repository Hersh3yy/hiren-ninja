<template>
  <button
    type="button"
    :aria-pressed="pressed === null ? undefined : pressed"
    :class="classes"
    @click="$emit('click', $event)"
  >
    {{ text }}<span v-if="count !== null" class="ml-1 opacity-60">{{ count }}</span><span v-if="removable" aria-hidden="true" class="ml-1">✕</span>
  </button>
</template>

<script setup>
// One pill style for every toggle in the UI: filters, genres, intents, days.
const props = defineProps({
  text: { type: String, required: true },
  pressed: { type: Boolean, default: null },
  count: { type: Number, default: null },
  removable: { type: Boolean, default: false },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md'].includes(value)
  }
})

defineEmits(['click'])

const classes = computed(() => [
  'inline-flex items-center rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
  props.size === 'sm' ? 'px-3 py-1 text-sm' : 'px-4 py-1.5 text-sm font-bold uppercase tracking-wide',
  props.pressed || props.removable
    ? 'border-accent bg-accent text-ink font-bold'
    : 'border-border-default text-content hover:border-accent-muted'
].join(' '))
</script>

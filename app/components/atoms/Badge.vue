<template>
  <span :class="classes">{{ text }}</span>
</template>

<script setup>
const props = defineProps({
  text: { type: String, required: true },
  tone: {
    type: String,
    default: 'neutral',
    validator: (value) => ['neutral', 'accent', 'outline', 'success', 'danger', 'muted'].includes(value)
  }
})

const TONES = {
  neutral: 'bg-elevated text-content',
  accent: 'bg-accent text-ink',
  outline: 'border border-accent text-accent',
  success: 'bg-success-muted text-success',
  danger: 'bg-danger-muted text-danger',
  muted: 'border border-border-default text-content-muted'
}

const classes = computed(() => [
  'inline-flex items-center rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wide whitespace-nowrap',
  TONES[props.tone]
].join(' '))
</script>

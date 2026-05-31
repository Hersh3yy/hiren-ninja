<template>
  <div :class="containerClasses">
    <div v-if="type === 'spinner'" :class="spinnerClasses"></div>

    <div v-else-if="type === 'dots'" class="flex space-x-1">
      <div
        v-for="i in 3"
        :key="i"
        :class="dotClasses"
        :style="{ animationDelay: `${(i - 1) * 0.2}s` }"
      ></div>
    </div>

    <div v-else-if="type === 'pulse'" :class="pulseClasses"></div>

    <p v-if="text" :class="textClasses">{{ text }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'spinner',
    validator: (value) => ['spinner', 'dots', 'pulse'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  text: {
    type: String,
    default: null
  },
  overlay: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: 'accent',
    validator: (value) => ['accent', 'white', 'muted'].includes(value)
  }
})

const containerClasses = computed(() => {
  const baseClasses = 'flex flex-col items-center justify-center'
  const overlayClasses = props.overlay ? 'absolute inset-0 bg-ink/75 z-50' : ''

  return [baseClasses, overlayClasses].filter(Boolean).join(' ')
})

const colorMap = {
  border: { accent: 'border-accent', white: 'border-white', muted: 'border-content-muted' },
  bg: { accent: 'bg-accent', white: 'bg-white', muted: 'bg-content-muted' },
  text: { accent: 'text-accent', white: 'text-white', muted: 'text-content-muted' }
}

const spinnerClasses = computed(() => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4'
  }

  return [
    'animate-spin rounded-full border-t-transparent',
    sizeClasses[props.size],
    colorMap.border[props.color]
  ].join(' ')
})

const dotClasses = computed(() => {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  }

  return [
    'rounded-full animate-bounce',
    sizeClasses[props.size],
    colorMap.bg[props.color]
  ].join(' ')
})

const pulseClasses = computed(() => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return [
    'rounded-full animate-pulse',
    sizeClasses[props.size],
    colorMap.bg[props.color]
  ].join(' ')
})

const textClasses = computed(() => {
  return [
    'mt-2 text-sm font-medium',
    colorMap.text[props.color]
  ].join(' ')
})
</script>

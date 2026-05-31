<template>
  <component :is="tag" :class="headingClasses">{{ text }}</component>
</template>

<script setup>
const props = defineProps({
  text: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    default: 2,
    validator: (value) => [1, 2, 3, 4].includes(value)
  },
  size: {
    type: String,
    default: null,
    validator: (value) => value === null || ['sm', 'md', 'lg', 'xl', '2xl'].includes(value)
  },
  accent: {
    type: Boolean,
    default: true
  }
})

const tag = computed(() => `h${props.level}`)

const defaultSizeByLevel = {
  1: '2xl',
  2: 'xl',
  3: 'lg',
  4: 'md'
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl sm:text-4xl',
  '2xl': 'text-4xl sm:text-5xl'
}

const headingClasses = computed(() => {
  const resolvedSize = props.size ?? defaultSizeByLevel[props.level]
  return [
    'font-bold tracking-tight',
    sizeClasses[resolvedSize],
    props.accent ? 'text-accent' : 'text-content'
  ].join(' ')
})
</script>

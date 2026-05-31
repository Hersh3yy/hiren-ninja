<template>
  <component :is="as" :class="cardClasses">
    <slot />
  </component>
</template>

<script setup>
// Layout-shell molecule: a single default slot is intentional here so the card
// can wrap arbitrary section content (see project rule on slots vs props).
const props = defineProps({
  as: {
    type: String,
    default: 'div'
  },
  interactive: {
    type: Boolean,
    default: false
  },
  padded: {
    type: Boolean,
    default: true
  }
})

const cardClasses = computed(() => {
  return [
    'bg-surface/80 backdrop-blur-xl rounded-xl border border-border-subtle transition-all',
    props.padded ? 'p-6' : '',
    props.interactive ? 'hover:border-accent-muted' : ''
  ].filter(Boolean).join(' ')
})
</script>

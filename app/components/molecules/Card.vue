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
  },
  // Frosted glass over the birds. Turn it off for cards that grow very tall (tool
  // results): browsers drop oversized backdrop-filter layers, so the card flickers
  // away and the birds show through.
  blur: {
    type: Boolean,
    default: true
  }
})

const cardClasses = computed(() => {
  return [
    'rounded-xl border border-border-subtle transition-all',
    props.blur ? 'bg-surface/80 backdrop-blur-xl' : 'bg-surface/95',
    props.padded ? 'p-4 sm:p-6' : '',
    props.interactive ? 'hover:border-accent-muted cursor-pointer' : ''
  ].filter(Boolean).join(' ')
})
</script>

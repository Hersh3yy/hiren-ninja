<template>
  <article :class="cardClasses">
    <div v-if="iconPath" class="mb-4 inline-flex items-center justify-center w-11 h-11 rounded-lg bg-accent/10 text-accent">
      <AtomsIcon :path="iconPath" size="md" />
    </div>
    <h3 class="text-lg font-semibold text-content mb-2">{{ title }}</h3>
    <p class="text-sm leading-relaxed text-content-muted">{{ description }}</p>
  </article>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  iconPath: {
    type: String,
    default: null
  },
  featured: {
    type: Boolean,
    default: false
  }
})

const cardClasses = computed(() => {
  return [
    'group h-full rounded-xl border border-border-subtle bg-surface/80 p-6 backdrop-blur-xl',
    'transition-all duration-300 hover:border-accent-muted hover:ring-1 hover:ring-accent/30',
    props.featured ? 'lg:col-span-2' : ''
  ].filter(Boolean).join(' ')
})
</script>

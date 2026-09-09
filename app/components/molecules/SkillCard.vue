<template>
  <MoleculesCard
    as="article"
    :class="featured ? 'lg:col-span-2' : ''"
    interactive
  >
    <div
      v-if="iconPath"
      class="mb-4 inline-flex items-center justify-center w-11 h-11 rounded-lg bg-accent/10 text-accent"
    >
      <AtomsIcon :path="iconPath" size="md" />
    </div>
    <AtomsHeading :text="title" :level="3" size="sm" :accent="false" class="mb-2" />
    <p class="text-sm leading-relaxed text-content-muted">{{ description }}</p>
  </MoleculesCard>
</template>

<script setup>
defineProps({
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
</script>

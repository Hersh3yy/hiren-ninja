<template>
  <MoleculesCard>
    <AtomsHeading :text="title" :level="4" size="md" class="mb-2" />
    <p class="text-content-muted text-sm">{{ description }}</p>
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
  }
})
</script>

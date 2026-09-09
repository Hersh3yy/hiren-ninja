<template>
  <MoleculesCard class="h-full flex flex-col">
    <div class="mb-4">
      <AtomsHeading :text="title" :level="2" size="lg" />
      <p class="text-content-muted mt-2">{{ description }}</p>
    </div>
    <div class="flex-grow">
      <ul class="list-disc list-inside space-y-2 text-content-muted">
        <li v-for="feature in features" :key="feature">{{ feature }}</li>
      </ul>
    </div>
    <AtomsButton
      text="Get Started"
      full-width
      class="mt-6"
      :aria-label="`Get started with ${title}`"
      :data-umami-event="`Service clicked ${title}`"
      @click="$emit('start')"
    />
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
  features: {
    type: Array,
    required: true
  }
})

defineEmits(['start'])
</script>

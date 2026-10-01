<template>
  <div class="text-content">
    <div class="w-full py-12 px-2 sm:px-4 lg:px-6 xl:px-8">
      <div class="text-center mb-12 max-w-4xl mx-auto">
        <AtomsHeading text="Experiments" :level="1" size="2xl" class="mb-4 experiments-title" />
        <p class="text-xl text-content-muted max-w-2xl mx-auto">
          Interactive prototypes and creative coding experiments. Each experiment showcases different technologies and creative approaches.
        </p>
      </div>

      <div class="w-full space-y-4">
        <ExperimentsCollapsible
          v-for="experiment in experiments"
          :key="experiment.id"
          :experiment="experiment"
          :is-open="openExperiment === experiment.id"
          @toggle="toggleExperiment"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'Experiments - Hiren Ninja',
  meta: [
    { name: 'description', content: 'Interactive prototypes and creative coding experiments by Hiren' },
    { property: 'og:title', content: 'Experiments - Hiren Ninja' },
    { property: 'og:description', content: 'Interactive prototypes and creative coding experiments' },
    { name: 'robots', content: 'index, follow' }
  ]
})

const openExperiment = ref(null)

const experiments = Object.freeze([
  {
    id: 'led-sculpture-generator',
    title: 'LED Sculpture Generator',
    description: 'Generate 3D curved paths for LED light sculptures using parametric algorithms.'
  }
])

function toggleExperiment(experimentId, open) {
  if (open) openExperiment.value = experimentId
  else if (openExperiment.value === experimentId) openExperiment.value = null
}
</script>

<style scoped>
:deep(.experiments-title) {
  background-image: linear-gradient(
    to right,
    theme('colors.accent.DEFAULT'),
    theme('colors.accent.hover')
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

@supports not (background-clip: text) {
  :deep(.experiments-title) {
    color: theme('colors.accent.DEFAULT');
    background-image: none;
  }
}
</style>

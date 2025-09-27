<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <div class="container mx-auto py-12 px-4">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Experiments
        </h1>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto">
          Interactive prototypes and creative coding experiments. Each experiment showcases different technologies and creative approaches.
        </p>
      </div>
      
      <!-- Experiments List as Collapsibles -->
      <div class="max-w-4xl mx-auto space-y-4">
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
// SEO and meta
useHead({
  title: 'Experiments - Hiren Ninja',
  meta: [
    { name: 'description', content: 'Interactive prototypes and creative coding experiments by Hiren' },
    { property: 'og:title', content: 'Experiments - Hiren Ninja' },
    { property: 'og:description', content: 'Interactive prototypes and creative coding experiments' },
    { name: 'robots', content: 'index, follow' }
  ]
})

// Reactive state for open experiment
const openExperiment = ref(null)

// Experiments data - simplified for prototyping
const experiments = [
  {
    id: 'led-sculpture-generator',
    title: 'LED Sculpture Generator', 
    description: 'Generate 3D curved paths for LED light sculptures using parametric algorithms.'
  }
  // Future experiments will be added here
]

// Toggle experiment open/close (only one at a time)
function toggleExperiment(experimentId) {
  if (openExperiment.value === experimentId) {
    openExperiment.value = null
  } else {
    openExperiment.value = experimentId
  }
}
</script>

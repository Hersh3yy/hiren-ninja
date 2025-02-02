<template>
  <div v-if="project" class="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50"
    @click.self="emit('close')">
    <div class="bg-gray-800 rounded-lg w-full max-w-2xl mt-20 max-h-[calc(100vh-5rem)] overflow-y-auto relative">
      <div class="sticky top-0 bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 class="text-xl sm:text-2xl font-bold text-white pr-8">
          {{ project.title }}
        </h2>
        <button @click="emit('close')" class="text-gray-400 hover:text-white transition-colors"
          aria-label="Close modal">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="p-4 sm:p-6">
        <div class="space-y-4">
          <p class="text-gray-300 text-base sm:text-lg whitespace-pre-wrap">
            {{ project.fullDescription }}
          </p>

          <div class="flex items-center space-x-2">
            <span class="text-gray-400">Published:</span>
            <span class="text-white">{{ formatDate(project.publishedAt) }}</span>
          </div>

          <div class="flex items-center space-x-2">
            <span class="text-gray-400">Role:</span>
            <span class="text-white">{{ project.role }}</span>
          </div>

          <div v-if="project.url" class="flex items-center space-x-2">
            <span class="text-gray-400">URL:</span>
            <a :href="project.url" target="_blank" rel="noopener noreferrer"
              class="text-yellow-300 hover:text-yellow-400 transition-colors">
              {{ project.url }}
            </a>
          </div>

          <!-- Screenshots section -->
          <div v-if="project.screenshots?.length" class="space-y-4">
            <h3 class="text-lg font-semibold text-white">Screenshots:</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <img v-for="screenshot in project.screenshots" :key="screenshot.id" :src="screenshot.url"
                :alt="`${project.title} screenshot`" class="w-full rounded-lg shadow-lg" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(["close"]);

defineProps({
  project: {
    type: Object,
    default: null,
  },
});

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
</script>
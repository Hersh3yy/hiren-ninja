<template>
  <div
    v-if="project"
    class="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50"
    @click.self="emit('close')"
  >
    <div
      class="bg-gray-800 rounded-lg w-full max-w-2xl mt-20 max-h-[calc(100vh-5rem)] overflow-y-auto relative"
    >
      <div
        class="sticky top-0 bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center"
      >
        <h2 class="text-xl sm:text-2xl font-bold text-white pr-8">
          {{ project.name }}
        </h2>
        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div class="p-4 sm:p-6">
        <div class="space-y-4">
          <p class="text-gray-300 text-base sm:text-lg whitespace-pre-wrap">
            {{ project.description }}
          </p>
          <div class="flex items-center space-x-2">
            <span class="text-gray-400">Year:</span>
            <span class="text-white">{{ project.year }}</span>
          </div>
          <div v-if="project.tech_tags?.length" class="space-y-2">
            <h3 class="text-lg font-semibold text-white">Technologies:</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in project.tech_tags"
                :key="tag.id"
                class="bg-gray-700 text-white px-3 py-1 rounded-full text-sm"
              >
                {{ tag.name }}
              </span>
            </div>
          </div>
          <div v-if="project.image_urls?.length" class="space-y-4">
            <img
              v-for="(url, index) in project.image_urls"
              :key="index"
              :src="url"
              :alt="`${project.name} image ${index + 1}`"
              class="w-full rounded-lg shadow-lg"
              loading="lazy"
            />
          </div>
          <!-- Screenshots section -->
          <div v-if="project.screenshots?.length" class="space-y-4">
            <h3 class="text-lg font-semibold text-white">Screenshots:</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <img
                v-for="(url, index) in project.screenshots"
                :key="index"
                :src="url"
                :alt="`${project.name} screenshot ${index + 1}`"
                class="w-full rounded-lg shadow-lg"
                loading="lazy"
              />
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
</script>

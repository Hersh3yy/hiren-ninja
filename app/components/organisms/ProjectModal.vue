<template>
  <div v-if="project" class="modal-container" @click.self="emit('close')">
    <div class="modal-content w-full max-w-2xl mt-20 max-h-[calc(100vh-5rem)] overflow-y-auto relative">
      <div class="aspect-video relative overflow-hidden" @click="expandImage(project.coverImage?.url)">
        <img v-if="project.coverImage?.url" :src="project.coverImage.url" :alt="project.title"
          class="w-full h-full object-cover zoomable-image" />
      </div>
      <div class="sticky top-0 bg-surface p-4 border-b border-border-subtle flex justify-between items-center">
        <h2 class="text-xl sm:text-2xl font-bold text-content pr-8">
          {{ project.title }}
        </h2>
        <button @click="emit('close')" class="btn-close" aria-label="Close modal">
          <AtomsIcon :path="closeIconPath" size="md" />
        </button>
      </div>
      <div class="p-4 sm:p-6">
        <div class="space-y-4">
          <div class="text-content-muted text-base sm:text-lg whitespace-pre-wrap" v-html="formattedDescription">
          </div>

          <div v-if="project.projectType" class="flex items-center space-x-2">
            <span class="text-content-muted">Type:</span>
            <span class="text-content">{{ formatProjectType(project.projectType) }}</span>
          </div>

          <div v-if="project.url" class="flex items-center space-x-2">
            <span class="text-content-muted">URL:</span>
            <a :href="project.url" target="_blank" rel="noopener noreferrer"
              class="text-accent hover:text-accent-hover transition-colors">
              {{ project.url }}
            </a>
          </div>

          <div v-if="project.screenshots?.length" class="space-y-4">
            <h3 class="text-lg font-semibold text-content">Screenshots:</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-for="screenshot in project.screenshots" :key="screenshot.id"
                class="image-container"
                @click="expandImage(screenshot.url)">
                <img :src="screenshot.url"
                  :alt="`${project.title} screenshot`"
                  class="w-full shadow-lg zoomable-image"
                  loading="lazy" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="expandedImageUrl"
    class="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] cursor-zoom-out"
    @click="expandedImageUrl = null">
    <img :src="expandedImageUrl"
      class="max-w-[90vw] max-h-[90vh] object-contain"
      alt="Expanded view" />
    <button
      @click="expandedImageUrl = null"
      class="absolute top-4 right-4 text-white hover:text-accent transition-colors"
      aria-label="Close expanded image">
      <AtomsIcon :path="closeIconPath" size="lg" />
    </button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const closeIconPath = 'M6 18L18 6M6 6l12 12'

const emit = defineEmits(['close'])
const expandedImageUrl = ref(null)

const props = defineProps({
  project: {
    type: Object,
    default: null
  }
})

function expandImage(url) {
  if (url) {
    expandedImageUrl.value = url
  }
}

const formattedDescription = computed(() => {
  if (!props.project?.fullDescription) return ''

  const parts = props.project.fullDescription.split('***').map(item => item.trim()).filter(item => item)

  if (parts.length === 0) return ''

  let result = parts[0]

  if (parts.length > 1) {
    const listItems = parts.slice(1).map(item => `<li>${item}</li>`).join('')
    result += `<ul>${listItems}</ul>`
  }

  return result
})

function formatProjectType(type) {
  if (type === 'website') return 'Website'
  if (type === 'webApplication') return 'Web Application'
  return type
}
</script>

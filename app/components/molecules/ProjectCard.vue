<template>
  <div class="card cursor-pointer group overflow-hidden !p-0" @click="emit('click', project)">
    <div class="aspect-video relative overflow-hidden">
      <img v-if="project.coverImage?.url" :src="project.coverImage.url" :alt="project.title"
        class="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105" >
      <div v-else class="w-full h-full bg-elevated flex items-center justify-center">
        <span class="text-content-muted">No Image</span>
      </div>
    </div>

    <div class="p-4 flex flex-col flex-grow">
      <div class="flex items-start justify-between gap-2 mb-2">
        <h2 class="text-base sm:text-lg font-semibold text-content break-words">
          {{ project.title }}
        </h2>
        <span class="text-xs sm:text-sm text-content-muted whitespace-nowrap">
          {{ project.year }}
        </span>
      </div>

      <p class="text-xs sm:text-sm text-content-muted mb-4 line-clamp-3 break-words">
        {{ project.shortDescription }}
      </p>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['click'])

defineProps({
  project: {
    type: Object,
    required: true
  }
})
</script>

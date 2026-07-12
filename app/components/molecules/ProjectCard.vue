<template>
  <article
    role="button"
    tabindex="0"
    class="card cursor-pointer group overflow-hidden !p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
    :aria-label="`Open project: ${project.title}`"
    :data-project-card-id="project.id"
    @click="emit('click', project, $event)"
    @keydown.enter.prevent="emit('click', project, $event)"
    @keydown.space.prevent="emit('click', project, $event)"
  >
    <div class="aspect-video relative overflow-hidden bg-elevated">
      <img
        v-if="project.coverImage?.url"
        :src="project.coverImage.url"
        :alt="project.title"
        class="project-card-cover w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105 group-focus-visible:scale-105"
        :data-project-cover="project.id"
      >
      <div v-else class="w-full h-full flex items-center justify-center">
        <span class="text-content-muted text-sm">No Image</span>
      </div>

      <span
        class="absolute bottom-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink/70 text-content text-xs font-semibold border border-border-subtle opacity-80 group-hover:opacity-100 transition-opacity"
        aria-hidden="true"
      >
        i
      </span>
    </div>

    <div class="p-4 flex flex-col gap-1">
      <div class="flex items-start justify-between gap-2">
        <h2 class="text-base sm:text-lg font-semibold text-content uppercase tracking-wide break-words leading-snug">
          {{ project.title }}
        </h2>
        <span class="text-xs text-content-muted whitespace-nowrap pt-1">
          {{ project.year }}
        </span>
      </div>

      <p class="text-xs sm:text-sm text-content-muted line-clamp-2 break-words">
        {{ project.shortDescription }}
      </p>
    </div>
  </article>
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

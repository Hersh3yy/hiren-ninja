<template>
  <div class="flex flex-col gap-3">
    <button
      type="button"
      class="aspect-video relative overflow-hidden rounded-lg bg-elevated focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      :aria-label="`Expand image for ${title}`"
      @click="emit('expand', activeImageUrl)"
    >
      <img
        v-if="activeImageUrl"
        :src="activeImageUrl"
        :alt="`${title} preview`"
        class="project-modal-hero w-full h-full object-cover"
        data-project-hero
      >
      <div v-else class="w-full h-full flex items-center justify-center text-content-muted text-sm">
        No image
      </div>
    </button>

    <div v-if="images.length > 1" class="flex items-center gap-2">
      <MoleculesIconButton
        :icon-path="ICONS.chevronLeft"
        label="Previous image"
        :disabled="activeIndex === 0"
        @click="activeIndex = Math.max(0, activeIndex - 1)"
      />

      <div class="flex gap-2 overflow-x-auto py-1 flex-1" role="group" aria-label="Project screenshots">
        <button
          v-for="(image, index) in images"
          :key="image.id || image.url || index"
          type="button"
          class="shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          :class="index === activeIndex ? 'border-accent' : 'border-transparent opacity-70 hover:opacity-100'"
          :aria-label="`Show image ${index + 1} of ${images.length}`"
          :aria-pressed="index === activeIndex"
          @click="activeIndex = index"
        >
          <img :src="image.url" alt="" class="w-full h-full object-cover" loading="lazy">
        </button>
      </div>

      <MoleculesIconButton
        :icon-path="ICONS.chevronRight"
        label="Next image"
        :disabled="activeIndex >= images.length - 1"
        @click="activeIndex = Math.min(images.length - 1, activeIndex + 1)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ICONS } from '~/utils/icons'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  coverUrl: {
    type: String,
    default: ''
  },
  screenshots: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['expand'])

const activeIndex = ref(0)

const images = computed(() => {
  const shots = (props.screenshots || []).filter((s) => s?.url)
  if (shots.length > 0) {
    const cover = props.coverUrl
    const withoutDupCover = cover
      ? shots.filter((s) => s.url !== cover)
      : shots

    if (cover) {
      return [{ id: 'cover', url: cover }, ...withoutDupCover]
    }
    return shots
  }

  if (props.coverUrl) {
    return [{ id: 'cover', url: props.coverUrl }]
  }

  return []
})

const activeImageUrl = computed(() => images.value[activeIndex.value]?.url || '')

watch(
  () => props.coverUrl,
  () => {
    activeIndex.value = 0
  }
)

defineExpose({
  activeImageUrl
})
</script>

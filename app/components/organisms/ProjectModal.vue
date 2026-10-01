<template>
  <MoleculesModalShell
    :is-open="!!project"
    :title="project?.title || 'Project'"
    :title-id="titleId"
    close-label="Close project details"
    panel-class="max-w-5xl max-h-[90vh] lg:h-[min(90vh,44rem)] overflow-y-auto relative"
    @close="emit('close')"
  >
    <template #header="{ titleId: id, close }">
      <div class="sticky top-0 z-10 bg-surface/95 backdrop-blur border-b border-border-subtle px-4 py-3 sm:px-6 flex justify-between items-center gap-4">
        <p class="text-xs uppercase tracking-widest text-content-muted">Project</p>
        <span :id="id" class="sr-only">{{ project?.title }}</span>
        <!-- Previous/next live in the sticky header so they never move while you click through. -->
        <div class="flex items-center gap-2">
          <template v-if="projects.length > 1">
            <span class="text-sm text-content-muted tabular-nums" aria-live="polite">
              {{ currentIndex + 1 }}/{{ projects.length }}
            </span>
            <MoleculesIconButton
              :icon-path="ICONS.chevronLeft"
              label="Previous project"
              variant="bordered"
              :disabled="currentIndex <= 0"
              aria-keyshortcuts="ArrowLeft"
              @click="emit('navigate', currentIndex - 1)"
            />
            <MoleculesIconButton
              :icon-path="ICONS.chevronRight"
              label="Next project"
              variant="bordered"
              :disabled="currentIndex >= projects.length - 1"
              aria-keyshortcuts="ArrowRight"
              @click="emit('navigate', currentIndex + 1)"
            />
          </template>
          <AtomsModalCloseButton label="Close project details" @click="close" />
        </div>
      </div>
    </template>

    <div v-if="project" class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 sm:p-6">
      <MoleculesProjectGallery
        :title="project.title"
        :cover-url="project.coverImage?.url || ''"
        :screenshots="project.screenshots || []"
        @expand="expandImage"
      />

      <div class="flex flex-col gap-5 min-w-0">
        <div>
          <AtomsHeading
            :text="project.title"
            :level="2"
            size="lg"
            :accent="false"
            class="uppercase tracking-wide"
            aria-hidden="true"
          />
          <p v-if="project.year" class="mt-1 text-sm text-content-muted">
            {{ project.year }}
            <span v-if="project.projectType"> · {{ formatProjectType(project.projectType) }}</span>
          </p>
        </div>

        <div>
          <AtomsHeading text="About" :level="3" size="sm" :accent="false" class="uppercase tracking-wide mb-2" />
          <div class="text-content-muted text-sm sm:text-base space-y-3 project-description" v-html="formattedDescription" />
        </div>

        <div v-if="project.url" class="pt-1">
          <AtomsButton
            text="Launch"
            :href="project.url"
            external
            data-umami-event="project-launch"
            :data-umami-event-project="project.title"
            :trailing-icon-path="ICONS.externalLink"
          />
        </div>

      </div>
    </div>
  </MoleculesModalShell>

  <!-- A second native dialog: it stacks on top of the project dialog, so Escape and
       the backdrop close the image first. -->
  <MoleculesModalShell
    :is-open="!!expandedImageUrl"
    bare
    :title-id="lightboxTitleId"
    close-label="Close expanded image"
    panel-class="max-w-[95vw] max-h-[95vh] cursor-zoom-out"
    @close="expandedImageUrl = null"
  >
    <template #header="{ titleId: id, close }">
      <span :id="id" class="sr-only">Expanded image for {{ project?.title || 'project' }}</span>
      <AtomsModalCloseButton
        class="absolute top-2 right-2 bg-ink/60 text-white hover:text-accent"
        label="Close expanded image"
        size="lg"
        @click="close"
      />
    </template>
    <img
      :src="expandedImageUrl"
      class="block max-w-[95vw] max-h-[95vh] object-contain"
      :alt="`Expanded view of ${project?.title || 'project'}`"
      @click="expandedImageUrl = null"
    >
  </MoleculesModalShell>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { ICONS } from '~/utils/icons'
import { escapeHtml } from '~/utils/escapeHtml'

const props = defineProps({
  project: {
    type: Object,
    default: null
  },
  projects: {
    type: Array,
    default: () => []
  },
  currentIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close', 'navigate'])

const titleId = useId()
const lightboxTitleId = useId()
const expandedImageUrl = ref(null)

const isLightboxOpen = computed(() => !!expandedImageUrl.value)

// ← and → step through projects; not while the full-size image is open or while typing.
function onArrowKey(event) {
  if (!props.project || isLightboxOpen.value || event.altKey || event.metaKey || event.ctrlKey) return
  if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable="true"]')) return
  if (event.key === 'ArrowLeft' && props.currentIndex > 0) {
    event.preventDefault()
    emit('navigate', props.currentIndex - 1)
  } else if (event.key === 'ArrowRight' && props.currentIndex < props.projects.length - 1) {
    event.preventDefault()
    emit('navigate', props.currentIndex + 1)
  }
}

onMounted(() => window.addEventListener('keydown', onArrowKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onArrowKey))

watch(
  () => props.project?.id,
  () => {
    expandedImageUrl.value = null
  }
)

function expandImage(url) {
  if (url) {
    expandedImageUrl.value = url
  }
}

const formattedDescription = computed(() => {
  if (!props.project?.fullDescription) {
    return props.project?.shortDescription
      ? `<p>${escapeHtml(props.project.shortDescription)}</p>`
      : ''
  }

  const parts = props.project.fullDescription
    .split('***')
    .map((item) => item.trim())
    .filter(Boolean)

  if (parts.length === 0) return ''

  // Blank lines in the intro are paragraph breaks.
  let result = parts[0]
    .split(/\n\s*\n/)
    .map((paragraph) => `<p>${escapeHtml(paragraph.trim())}</p>`)
    .join('')

  if (parts.length > 1) {
    const listItems = parts.slice(1).map((item) => `<li>${escapeHtml(item)}</li>`).join('')
    result += `<ul class="list-disc pl-5 space-y-1">${listItems}</ul>`
  }

  return result
})

function formatProjectType(type) {
  if (type === 'website') return 'Website'
  if (type === 'webApplication') return 'Web Application'
  if (type === 'desktopApplication') return 'Desktop App'
  return type
}
</script>

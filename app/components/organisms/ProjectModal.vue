<template>
  <MoleculesModalShell
    :is-open="!!project"
    :title="project?.title || 'Project'"
    :title-id="titleId"
    close-label="Close project details"
    panel-class="w-full max-w-5xl max-h-[90vh] lg:h-[min(90vh,44rem)] overflow-y-auto relative"
    @close="requestClose"
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

  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="expandedImageUrl"
        ref="lightboxRef"
        class="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] cursor-zoom-out p-4"
        role="dialog"
        aria-modal="true"
        :aria-label="`Expanded image for ${project?.title || 'project'}`"
        tabindex="-1"
        @click.self="expandedImageUrl = null"
      >
        <img
          :src="expandedImageUrl"
          class="max-w-[90vw] max-h-[90vh] object-contain"
          :alt="`Expanded view of ${project?.title || 'project'}`"
        >
        <AtomsModalCloseButton
          class="absolute top-4 right-4 text-white hover:text-accent"
          label="Close expanded image"
          size="lg"
          @click="expandedImageUrl = null"
        />
      </div>
    </Transition>
  </Teleport>
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
const lightboxRef = ref(null)
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

function requestClose() {
  if (expandedImageUrl.value) {
    expandedImageUrl.value = null
    return
  }
  emit('close')
}

useModalA11y({
  isOpen: isLightboxOpen,
  onClose: () => {
    expandedImageUrl.value = null
  },
  containerRef: lightboxRef
})

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

  let result = `<p>${escapeHtml(parts[0])}</p>`

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

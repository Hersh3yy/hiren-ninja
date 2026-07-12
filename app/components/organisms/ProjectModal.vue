<template>
  <Teleport to="body">
    <Transition name="project-modal">
      <div
        v-if="project"
        class="modal-container items-center"
        @click.self="requestClose"
      >
        <div
          ref="dialogRef"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
          class="modal-content w-full max-w-5xl max-h-[min(90vh,52rem)] overflow-y-auto relative outline-none"
        >
          <div class="sticky top-0 z-10 bg-surface/95 backdrop-blur border-b border-border-subtle px-4 py-3 sm:px-6 flex justify-between items-center gap-4">
            <p class="text-xs uppercase tracking-widest text-content-muted">Project</p>
            <AtomsModalCloseButton label="Close project details" @click="requestClose" />
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 sm:p-6">
            <MoleculesProjectGallery
              :title="project.title"
              :cover-url="project.coverImage?.url || ''"
              :screenshots="project.screenshots || []"
              @expand="expandImage"
            />

            <div class="flex flex-col gap-5 min-w-0">
              <div>
                <h2 :id="titleId" class="text-2xl sm:text-3xl font-bold text-content uppercase tracking-wide">
                  {{ project.title }}
                </h2>
                <p v-if="project.year" class="mt-1 text-sm text-content-muted">
                  {{ project.year }}
                  <span v-if="project.projectType"> · {{ formatProjectType(project.projectType) }}</span>
                </p>
              </div>

              <div>
                <h3 class="text-sm font-semibold uppercase tracking-wide text-content mb-2">About</h3>
                <div class="text-content-muted text-sm sm:text-base space-y-3 project-description" v-html="formattedDescription" />
              </div>

              <div v-if="project.url" class="pt-1">
                <a
                  :href="project.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn-primary inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface"
                >
                  <span>Launch</span>
                  <AtomsIcon :path="externalLinkPath" size="sm" />
                </a>
              </div>

              <div
                v-if="projects.length > 1"
                class="mt-auto pt-4 flex items-center justify-end gap-3 border-t border-border-subtle"
              >
                <span class="text-sm text-content-muted tabular-nums" aria-live="polite">
                  {{ currentIndex + 1 }}/{{ projects.length }}
                </span>
                <button
                  type="button"
                  class="rounded-full p-2 border border-border-default text-content-muted hover:text-content hover:border-accent-muted focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-40"
                  aria-label="Previous project"
                  :disabled="currentIndex <= 0"
                  @click="emit('navigate', currentIndex - 1)"
                >
                  <AtomsIcon :path="chevronLeftPath" size="sm" />
                </button>
                <button
                  type="button"
                  class="rounded-full p-2 border border-border-default text-content-muted hover:text-content hover:border-accent-muted focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-40"
                  aria-label="Next project"
                  :disabled="currentIndex >= projects.length - 1"
                  @click="emit('navigate', currentIndex + 1)"
                >
                  <AtomsIcon :path="chevronRightPath" size="sm" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="lightbox">
      <div
        v-if="expandedImageUrl"
        class="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] cursor-zoom-out"
        role="dialog"
        aria-modal="true"
        aria-label="Expanded project image"
        @click="expandedImageUrl = null"
      >
        <img
          :src="expandedImageUrl"
          class="max-w-[90vw] max-h-[90vh] object-contain"
          alt="Expanded project view"
        >
        <AtomsModalCloseButton
          class="absolute top-4 right-4 text-white hover:text-accent"
          label="Close expanded image"
          size="lg"
          @click.stop="expandedImageUrl = null"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref, useId, watch } from 'vue'

const externalLinkPath = 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
const chevronLeftPath = 'M15 19l-7-7 7-7'
const chevronRightPath = 'M9 5l7 7-7 7'

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
const dialogRef = ref(null)
const expandedImageUrl = ref(null)

const isOpen = computed(() => !!props.project)

function requestClose() {
  if (expandedImageUrl.value) {
    expandedImageUrl.value = null
    return
  }
  emit('close')
}

useModalA11y({
  isOpen,
  onClose: requestClose,
  containerRef: dialogRef
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

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function formatProjectType(type) {
  if (type === 'website') return 'Website'
  if (type === 'webApplication') return 'Web Application'
  return type
}
</script>

<template>
  <div>
    <div v-if="error" class="rounded-lg bg-danger-muted p-4 mb-8" role="alert">
      <p class="text-danger">Error loading projects: {{ error }}</p>
    </div>

    <div
      v-else-if="loading"
      class="flex justify-center items-center h-64"
      aria-busy="true"
    >
      <AtomsLoader type="spinner" size="lg" color="accent" text="Loading projects" />
    </div>

    <template v-else>
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6"
      >
        <MoleculesProjectCard
          v-for="(project, i) in sortedProjects"
          :key="project.id"
          :project="project"
          :eager="i < 4"
          :data-umami-event="`Project clicked ${project.title}`"
          @click="openModal"
        />
      </div>

      <div v-if="sortedProjects.length === 0" class="text-center mt-4" role="status">
        <p class="text-content-muted">No projects to show yet.</p>
      </div>

      <OrganismsProjectModal
        :project="selectedProject"
        :projects="sortedProjects"
        :current-index="selectedIndex"
        @close="closeModal"
        @navigate="navigateToIndex"
      />
    </template>
  </div>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'

const { data, pending: loading, error: fetchError } = await useFetch('/api/projects', { key: 'projects' })

const error = computed(() => fetchError.value?.statusMessage || fetchError.value?.message || '')
const sortedProjects = computed(() => data.value || [])
const selectedIndex = ref(-1)
const originCardId = ref(null)

const { morph } = useSharedElementTransition()

const selectedProject = computed(() => {
  if (selectedIndex.value < 0) return null
  return sortedProjects.value[selectedIndex.value] || null
})

const coverOf = id => document.querySelector(`[data-project-cover="${id}"]`)
const hero = () => document.querySelector('[data-project-hero]')

// The card's cover grows into the dialog's hero image, and shrinks back on close.
async function openModal(project) {
  const index = sortedProjects.value.findIndex((p) => p.id === project.id)
  if (index < 0) return

  await morph(project.coverImage?.url ? coverOf(project.id) : null, async () => {
    originCardId.value = project.id
    selectedIndex.value = index
    await nextTick()
  }, hero)
}

async function closeModal() {
  const cardId = originCardId.value
  await morph(hero(), async () => {
    selectedIndex.value = -1
    originCardId.value = null
    await nextTick()
  }, () => (cardId ? coverOf(cardId) : null))
}

function navigateToIndex(index) {
  if (index < 0 || index >= sortedProjects.value.length) return
  selectedIndex.value = index
  originCardId.value = sortedProjects.value[index]?.id || originCardId.value
}
</script>

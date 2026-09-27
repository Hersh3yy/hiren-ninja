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
          v-for="project in sortedProjects"
          :key="project.id"
          :project="project"
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

const { runOpen, runClose } = useSharedElementTransition()

const selectedProject = computed(() => {
  if (selectedIndex.value < 0) return null
  return sortedProjects.value[selectedIndex.value] || null
})

async function openModal(project, event) {
  const index = sortedProjects.value.findIndex((p) => p.id === project.id)
  if (index < 0) return

  originCardId.value = project.id
  selectedIndex.value = index

  const coverEl = event?.currentTarget?.querySelector?.('[data-project-cover]')
    || document.querySelector(`[data-project-cover="${project.id}"]`)

  await nextTick()

  if (coverEl && project.coverImage?.url) {
    await runOpen({
      sourceEl: coverEl,
      targetSelector: '[data-project-hero]',
      imageUrl: project.coverImage.url
    })
  }
}

async function closeModal() {
  const project = selectedProject.value
  const coverEl = originCardId.value
    ? document.querySelector(`[data-project-cover="${originCardId.value}"]`)
    : null
  const heroEl = document.querySelector('[data-project-hero]')

  if (coverEl && heroEl && project?.coverImage?.url) {
    await runClose({
      sourceSelector: heroEl,
      targetEl: coverEl,
      imageUrl: project.coverImage.url
    })
  }

  selectedIndex.value = -1
  originCardId.value = null
}

function navigateToIndex(index) {
  if (index < 0 || index >= sortedProjects.value.length) return
  selectedIndex.value = index
  originCardId.value = sortedProjects.value[index]?.id || originCardId.value
}
</script>

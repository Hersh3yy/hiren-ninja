<template>
  <div>
    <div v-if="error" class="rounded-lg bg-red-900/40 p-4 mb-8">
      <p class="text-red-200">Error loading projects: {{ error }}</p>
    </div>

    <div v-else-if="loading" class="flex justify-center items-center h-64">
      <AtomsLoader type="spinner" size="lg" color="accent" />
    </div>

    <template v-else>
      <div v-if="availableTypes.length > 1" class="flex flex-wrap gap-2 mb-8">
        <button
          v-for="type in availableTypes"
          :key="type"
          class="px-4 py-1.5 rounded-full text-sm font-medium border transition-colors duration-200"
          :class="activeFilter === type
            ? 'bg-accent text-ink border-accent'
            : 'bg-transparent text-content-muted border-border-default hover:border-accent-muted hover:text-content'"
          :aria-pressed="activeFilter === type"
          @click="activeFilter = type"
        >
          {{ type }}
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
        <MoleculesProjectCard
          v-for="project in sortedProjects"
          :key="project.id"
          :project="project"
          :data-umami-event="`Project clicked ${project.title}`"
          @click="openModal(project)"
        />
      </div>

      <div v-if="sortedProjects.length === 0" class="text-center mt-4">
        <p class="text-content-muted">
          {{ activeFilter === 'All' ? 'No projects to show yet.' : `No ${activeFilter} projects to show yet.` }}
        </p>
      </div>

      <OrganismsProjectModal v-if="selectedProject" :project="selectedProject" @close="closeModal" />
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const query = gql`
  query GetProjects {
    projects {
      stage
      publishedAt
      updatedAt
      createdAt
      id
      title
      shortDescription
      fullDescription
      year
      url
      projectType
      slug
      coverImage {
        url
      }
      screenshots {
        url
        id
      }
    }
  }
`

const { data, loading, error } = await useAsyncQuery(query)

const projects = computed(() => data.value?.projects || [])
const selectedProject = ref(null)
const activeFilter = ref('All')

const availableTypes = computed(() => {
  const types = projects.value
    .map((p) => p.projectType)
    .filter(Boolean)
  return ['All', ...new Set(types)]
})

const sortedProjects = computed(() => {
  const sorted = [...projects.value].sort((a, b) => b.year - a.year)
  if (activeFilter.value === 'All') return sorted
  return sorted.filter((p) => p.projectType === activeFilter.value)
})

function openModal(project) {
  selectedProject.value = project
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  selectedProject.value = null
  document.body.style.overflow = ''
}
</script>

<template>
  <div>
    <div v-if="error" class="rounded-lg bg-red-900/40 p-4 mb-8">
      <p class="text-red-200">Error loading projects: {{ error }}</p>
    </div>

    <div v-else-if="loading" class="flex justify-center items-center h-64">
      <AtomsLoader type="spinner" size="lg" color="accent" />
    </div>

    <template v-else>
      <div class="mb-8 space-y-6 flex flex-col">
        <OrganismsProjectFilters :years="years" :active-filters="activeFilters" @toggle-filter="toggleFilter" />
        <OrganismsProjectTypeFilter v-model="activeTypeFilter" />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
        <MoleculesProjectCard
          v-for="project in filteredProjects"
          :key="project.id"
          :project="project"
          @click="openModal(project)"
          :data-umami-event="`Project clicked ${project.title}`"
        />
      </div>

      <div v-if="filteredProjects.length === 0" class="text-center mt-4">
        <p class="text-content-muted">No projects available for the selected year.</p>
      </div>

      <OrganismsProjectModal v-if="selectedProject" :project="selectedProject" @close="closeModal" />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

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
const activeFilters = ref([])
const activeTypeFilter = ref('both')

const years = computed(() => {
  const allYears = projects.value.map(project => project.year)
  return [...new Set(allYears)].sort((a, b) => b - a)
})

const filteredProjects = computed(() => {
  let filtered = [...(projects.value || [])]

  if (activeFilters.value.length > 0) {
    filtered = filtered.filter(project => {
      return activeFilters.value.some(filter => Number(filter) === project.year)
    })
  }

  if (activeTypeFilter.value !== 'both') {
    filtered = filtered.filter(project => project.projectType === activeTypeFilter.value)
  }

  return [...filtered].sort((a, b) => b.year - a.year)
})

function openModal(project) {
  selectedProject.value = project
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  selectedProject.value = null
  document.body.style.overflow = ''
}

function toggleFilter(tag) {
  const index = activeFilters.value.indexOf(tag)
  if (index > -1) {
    activeFilters.value.splice(index, 1)
  } else {
    activeFilters.value.push(tag)
  }
}

const route = useRoute()

onMounted(() => {
  const skillFilter = route.query.skill
  if (skillFilter) {
    activeFilters.value = [skillFilter]
  }
})
</script>

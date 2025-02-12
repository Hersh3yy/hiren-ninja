<template>
  <section class="min-h-screen">
    <div class="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-[90vw]">
      <!-- Header -->
      <div class="mb-8 sm:mb-12">
        <h1 class="page-title">My Projects</h1>
      </div>

      <!-- Error State -->
      <div v-if="error" class="rounded-lg bg-red-50 p-4 mb-8">
        <p class="text-red-700">Error loading projects: {{ error }}</p>
      </div>

      <div v-else-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>

      <template v-else>
        <!-- Filters -->
        <!-- <ProjectFilters :tags="tags" :active-filters="activeFilters" @toggle-filter="toggleFilter" class="mb-8" /> -->

        <!-- Projects Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
          <ProjectCard v-for="project in filteredProjects" :key="project.id" :project="project"
            @click="openModal(project)" />
        </div>

        <!-- Project Modal -->
        <ProjectModal v-if="selectedProject" :project="selectedProject" @close="closeModal" />
      </template>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
useHead({
  title: 'My Projects - Hiren',
  meta: [
    { name: 'description', content: 'Explore my projects showcasing custom solutions and application development.' },
    { property: 'og:title', content: 'My Projects - Hiren' },
    { property: 'og:description', content: 'Explore my projects showcasing custom solutions and application development.' },
    { property: 'og:image', content: '/path/to/project-image.jpg' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ]
})

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
      url
      role
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

// Data fetching with Apollo
const { data, loading, error } = await useAsyncQuery(query)

const projects = computed(() => data.value?.projects || [])
const selectedProject = ref(null)
const activeFilters = ref([])

const tags = computed(() => {
  const allTags = projects.value.flatMap((project) => [
    new Date(project.publishedAt).getFullYear().toString(),
    project.role || 'Personal'
  ])

  return [...new Set(allTags)].sort((a, b) => {
    return allTags.filter(tag => tag === b).length -
      allTags.filter(tag => tag === a).length
  })
})

// Update filteredProjects to use the new fields
const filteredProjects = computed(() => {
  if (activeFilters.value.length === 0) return projects.value

  return projects.value.filter(project =>
    activeFilters.value.some(filter =>
      new Date(project.publishedAt).getFullYear().toString() === filter
    )
  ).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
})

// Rest of your code remains the same...
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
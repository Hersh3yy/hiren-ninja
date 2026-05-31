<template>
  <div>
    <div v-if="error" class="rounded-lg bg-red-900/40 p-4 mb-8">
      <p class="text-red-200">Error loading projects: {{ error }}</p>
    </div>

    <div v-else-if="loading" class="flex justify-center items-center h-64">
      <AtomsLoader type="spinner" size="lg" color="accent" />
    </div>

    <template v-else>
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
        <p class="text-content-muted">No projects to show yet.</p>
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

const sortedProjects = computed(() => {
  return [...projects.value].sort((a, b) => b.year - a.year)
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

<template>
  <section class="min-h-screen">
    <div class="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-[90vw]">
      <div class="mb-8 sm:mb-12">
        <h1 class="page-title">My Projects</h1>
      </div>
      <ProjectFilters :tags="tags" :active-filters="activeFilters" @toggle-filter="toggleFilter" class="mb-8" />
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
        <ProjectCard v-for="project in filteredProjects" :key="project.id" :project="project"
          @click="openModal(project)" />
      </div>

      <ProjectModal :project="selectedProject" @close="closeModal" v-if="selectedProject" />
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";

const query = gql`
  query {
    projects {
      id
      title
      shortDescription
      fullDescription
      year
      for_employer
      tech_tags {
        name
      }
      coverImage {
        url
        fileName
        size
      }
      screenshots {
        url
        fileName
        size
      }
    }
  }
`;

// Fetch projects
const { data, error } = await useAsyncQuery(query, {}, {
  context: {
    headers: {
      Authorization: `Bearer ${process.env.HYGRAPH_API_KEY}`
    }
  }
});

if (error) console.error("GraphQL Error:", error);

const projects = ref(data?.value?.projects || []);
const selectedProject = ref(null);
const activeFilters = ref([]);

const tags = computed(() => {
  const allTags = projects.value.flatMap((project) => [
    project.year.toString(),
    project.for_employer ? "Employer" : "Personal",
    ...(project.tech_tags?.map((tag) => tag.name) || []),
  ]);
  return [...new Set(allTags)].sort((a, b) => {
    return allTags.filter(tag => tag === b).length - allTags.filter(tag => tag === a).length;
  });
});

const filteredProjects = computed(() => {
  let filtered = activeFilters.value.length === 0
    ? projects.value
    : projects.value.filter(project =>
      activeFilters.value.some(filter =>
        project.year.toString() === filter ||
        (filter === "Employer" && project.for_employer) ||
        (filter === "Personal" && !project.for_employer) ||
        project.tech_tags?.some(tag => tag.name === filter)
      )
    );
  return filtered.sort((a, b) => b.year - a.year);
});

function openModal(project) {
  selectedProject.value = project;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  selectedProject.value = null;
  document.body.style.overflow = "";
}

function toggleFilter(tag) {
  const index = activeFilters.value.indexOf(tag);
  if (index > -1) {
    activeFilters.value.splice(index, 1);
  } else {
    activeFilters.value.push(tag);
  }
}

const route = useRoute();

onMounted(() => {
  const skillFilter = route.query.skill;
  if (skillFilter) {
    activeFilters.value = [skillFilter];
  }
});
</script>

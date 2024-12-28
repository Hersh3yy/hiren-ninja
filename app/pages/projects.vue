<template>
  <section class="min-h-screen">
    <!-- Outer container with padding -->
    <div class="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-[90vw]">
      <div class="mb-8 sm:mb-12">
        <h1 class="page-title">My Projects</h1>
      </div>
      <ProjectFilters :tags="tags" :active-filters="activeFilters" @toggle-filter="toggleFilter" class="mb-8" />
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
        <ProjectCard v-for="project in filteredProjects" :key="project.id" :project="project"
          @click="openModal(project)" />
      </div>

      <!-- Pop Up -->
      <ProjectModal :project="selectedProject" @close="closeModal" v-if="selectedProject" />
    </div>
  </section>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://vdqhckweryvfeysnkpkn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcWhja3dlcnl2ZmV5c25rcGtuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNjQ5MTIxNSwiZXhwIjoyMDQyMDY3MjE1fQ.hxFkFxkWw_LvJqeV5x4Di4fEkmU9e6wt55I2S6aZ8Tw"
);

const projects = ref([]);
const selectedProject = ref(null);
const activeFilters = ref([]);

const tags = computed(() => {
  const allTags = projects.value.flatMap((project) => [
    project.year.toString(),
    project.for_employer ? "Employer" : "Personal",
    ...(project.tech_tags?.map((tag) => tag.name) || []),
  ]);
  return [...new Set(allTags)].sort((a, b) => {
    const countA = allTags.filter((tag) => tag === a).length;
    const countB = allTags.filter((tag) => tag === b).length;
    return countB - countA;
  });
});

const filteredProjects = computed(() => {
  let filtered =
    activeFilters.value.length === 0
      ? projects.value
      : projects.value.filter((project) =>
        activeFilters.value.some(
          (filter) =>
            project.year.toString() === filter ||
            (filter === "Employer" && project.for_employer) ||
            (filter === "Personal" && !project.for_employer) ||
            project.tech_tags?.some((tag) => tag.name === filter)
        )
      );

  // Sort by year in descending order (newest first)
  return filtered.sort((a, b) => b.year - a.year);
});

async function getProjects() {
  const { data, error } = await supabase.from("HirensProjects").select(`
      *,
      tech_tags:project_tech(tech_tags(*))
    `);

  if (error) {
    console.error("Error fetching projects:", error);
    return;
  }

  projects.value = data.map((project) => ({
    ...project,
    tech_tags: project.tech_tags.map((tt) => tt.tech_tags),
  }));
}

function openModal(project) {
  selectedProject.value = project;
  document.body.style.overflow = "hidden"; // Disable scrolling
}

function closeModal() {
  selectedProject.value = null;
  document.body.style.overflow = ""; // Re-enable scrolling
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

onMounted(async () => {
  await getProjects();

  // Check if we came from skills with a filter
  const skillFilter = route.query.skill;
  if (skillFilter) {
    activeFilters.value = [skillFilter];
  }
});
</script>

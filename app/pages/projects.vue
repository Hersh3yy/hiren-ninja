<template>
  <section class="min-h-screen bg-gradient-to-r from-gray-900 to-black">
    <!-- Outer container with padding -->
    <div class="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-[90vw]">
      <!-- Header section -->
      <div class="mb-8 sm:mb-12">
        <h1
          class="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-400 text-transparent bg-clip-text"
        >
          My Projects
        </h1>
      </div>

      <!-- Filters -->
      <ProjectFilters
        :tags="tags"
        :active-filters="activeFilters"
        @toggle-filter="toggleFilter"
        class="mb-8"
      />

      <!-- Projects grid with max width constraint -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6"
      >
        <ProjectCard
          v-for="project in filteredProjects"
          :key="project.id"
          :project="project"
          @click="openModal(project)"
        />
      </div>

      <ProjectModal
        :project="selectedProject"
        @close="closeModal"
        v-if="selectedProject"
      />
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
  if (activeFilters.value.length === 0) return projects.value;
  return projects.value.filter((project) =>
    activeFilters.value.some(
      (filter) =>
        project.year.toString() === filter ||
        (filter === "Employer" && project.for_employer) ||
        (filter === "Personal" && !project.for_employer) ||
        project.tech_tags?.some((tag) => tag.name === filter)
    )
  );
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
}

function closeModal() {
  selectedProject.value = null;
}

function toggleFilter(tag) {
  const index = activeFilters.value.indexOf(tag);
  if (index > -1) {
    activeFilters.value.splice(index, 1);
  } else {
    activeFilters.value.push(tag);
  }
}

onMounted(() => {
  getProjects();
});
</script>

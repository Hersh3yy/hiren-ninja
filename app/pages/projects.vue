<template>
  <div class="projects-page">
    <h1 class="text-3xl font-bold text-yellow-300 mb-6">My Projects</h1>

    <!-- Filters -->
    <div class="mb-6 overflow-x-auto whitespace-nowrap pb-2 mx-[-1rem] px-4">
      <div class="inline-flex space-x-2">
        <button
          v-for="tag in tags"
          :key="tag"
          @click="toggleFilter(tag)"
          :class="[
            'px-3 py-1 rounded-full text-sm flex-shrink-0',
            activeFilters.includes(tag)
              ? 'bg-yellow-300 text-black'
              : 'bg-gray-700 text-white',
          ]"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <!-- Projects Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
      <div
        v-for="project in filteredProjects"
        :key="project.id"
        @click="openModal(project)"
        class="bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer transition-transform hover:scale-105"
      >
        <div class="aspect-w-16 aspect-h-9">
          <img
            v-if="project.image_urls && project.image_urls.length > 0"
            :src="project.image_urls[0]"
            :alt="project.name"
            class="w-full h-full object-cover"
          />
        </div>
        <div class="p-4">
          <h2 class="text-xl font-semibold text-white mb-2">
            {{ project.name }}
          </h2>
          <p class="text-gray-400 text-sm mb-2">{{ project.year }}</p>
          <p class="text-gray-300 text-sm truncate">
            {{ project.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="selectedProject"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div
        class="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div class="p-6 relative">
          <button
            @click="closeModal"
            class="absolute top-2 right-2 text-gray-400 hover:text-white"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
          <h2 class="text-2xl font-bold text-white mb-4">
            {{ selectedProject.name }}
          </h2>
          <p class="text-gray-300 mb-4">{{ selectedProject.description }}</p>
          <p class="text-gray-400 mb-4">Year: {{ selectedProject.year }}</p>
          <div
            v-if="
              selectedProject.tech_tags && selectedProject.tech_tags.length > 0
            "
            class="mb-4"
          >
            <h3 class="text-lg font-semibold text-white mb-2">Technologies:</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in selectedProject.tech_tags"
                :key="tag.id"
                class="bg-gray-700 text-white px-2 py-1 rounded-full text-sm"
              >
                {{ tag.name }}
              </span>
            </div>
          </div>
          <div
            v-if="
              selectedProject.image_urls &&
              selectedProject.image_urls.length > 0
            "
            class="mb-4"
          >
            <img
              v-for="(url, index) in selectedProject.image_urls"
              :key="index"
              :src="url"
              :alt="`${selectedProject.name} image ${index + 1}`"
              class="w-full h-auto mb-2 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
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
  } else {
    projects.value = data.map((project) => ({
      ...project,
      tech_tags: project.tech_tags.map((tt) => tt.tech_tags),
    }));
  }
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

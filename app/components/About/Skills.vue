<!-- components/about/Skills.vue -->
<template>
  <div>
    <h2 class="page-title">Skills & Journey</h2>

    <!-- Skills Narrative -->
    <div class="text-white mb-8">
      <p class="mb-4">
        My programming journey began with foundational languages like C, C++, and C#,
        sparking my interest in development. I started my career as a backend web
        developer, primarily using PHP, and over time, I absorbed frontend development
        as well, working extensively with Vue.js. This full-stack perspective allowed
        me to become a developer who enjoys seeing projects through from start to finish.
      </p>
      <p class="mb-4">
        I’m now working at a higher level, where I can contribute strategically by
        automating processes and delivering clean, efficient code. I’ve also begun
        delegating to junior developers and value collaboration to accomplish business
        goals while improving workflow with smart, sustainable solutions.
      </p>
    </div>

    <!-- Technology Categories -->
    <h2 class="section-title">Main technologies</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div v-for="(category, index) in categories" :key="index" class="card">
        <h4 class="text-yellow-300 font-bold mb-4">{{ category.name }}</h4>
        <div class="flex flex-wrap gap-4">
          <div v-for="tech in category.tech" :key="tech.name" class="flex flex-col items-center group">
            <img :src="`/icons/${tech.icon}`" :alt="tech.name" class="h-8 w-8 mb-2" loading="lazy" />
            <span class="text-xs text-white text-center">{{ tech.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const categories = [
  {
    name: "Frontend",
    tech: [
      { name: "Vue.js", icon: "vue.svg", linkToProjects: true },
      { name: "Nuxt", icon: "nuxt.svg", linkToProjects: false },
      { name: "TypeScript", icon: "typescript.svg", linkToProjects: true },
      { name: "Tailwind", icon: "tailwindcss.svg", linkToProjects: true },
    ],
  },
  {
    name: "Backend",
    tech: [
      { name: "Node.js", icon: "nodejs.svg", linkToProjects: true },
      { name: "NestJS", icon: "nest.svg", linkToProjects: true },
      { name: "Laravel", icon: "laravel.svg", linkToProjects: true },
      { name: "PHP", icon: "php.svg", linkToProjects: true },
      { name: "GraphQL", icon: "graphql.svg", linkToProjects: true },
    ],
  },
  {
    name: "Databases and Tools",
    tech: [
      { name: "MySQL", icon: "database.svg", linkToProjects: true },
      { name: "PostgreSQL", icon: "postgresql.svg", linkToProjects: true },
      { name: "Figma", icon: "figma.svg", linkToProjects: false },
      { name: "GCP", icon: "gcp.svg", linkToProjects: false },
    ],
  },
];

const navigateToProjects = (skillName) => {
  router.push({
    path: "/projects",
    query: { skill: skillName },
  });
};
</script>

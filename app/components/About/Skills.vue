<!-- components/about/Skills.vue -->
<template>
  <div>
    <h2 class="text-3xl font-bold text-yellow-300 mb-6">Skills & Journey</h2>

    <!-- Skills Narrative -->
    <div class="text-white mb-8">
      <p class="mb-4">
        Growing up on Sint Maarten sparked my interest in connecting people
        through technology. My foundation began with C++ and C# in school, where
        I discovered my passion for problem-solving.
      </p>

      <p class="mb-4">
        My professional journey started with PHP and Java web development,
        quickly evolving into more complex territory with PHP Symfony and
        microservices. The startup world opened new doors, introducing me to
        Vue.js and modern frontend development. Experience with GCP broadened my
        cloud infrastructure knowledge, while Nest.js and Node.js enhanced my
        backend capabilities.
      </p>

      <p class="mb-8">
        Now based in Amsterdam's dynamic tech scene, I've grown into a versatile
        full-stack developer. I continue to expand my toolkit, recently
        mastering Next.js and exploring new technologies that push the
        boundaries of web development.
      </p>
    </div>

    <!-- Technology Categories -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div
        v-for="(category, index) in categories"
        :key="index"
        class="bg-black/30 p-4 rounded-lg"
      >
        <h4 class="text-yellow-300 font-bold mb-3">{{ category.name }}</h4>
        <ul class="text-white text-sm space-y-2">
          <li
            v-for="skill in category.skills"
            :key="skill"
            class="cursor-pointer hover:text-yellow-300 transition-colors"
            @click="navigateToProjects(skill)"
          >
            {{ skill }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Skills Icons -->
    <h3 class="text-xl font-bold text-yellow-300 mb-4">Tech Stack</h3>
    <ul class="w-full flex flex-wrap items-center gap-4">
      <li
        v-for="(skill, index) in skills"
        :key="index"
        class="group relative flex items-center cursor-pointer"
        @click="navigateToProjects(skill.name)"
      >
        <div
          class="flex flex-col items-center transition duration-200 hover:scale-110"
        >
          <img
            :src="`/svg/${skill.icon}.svg`"
            :alt="skill.name"
            class="h-8 w-8"
            loading="lazy"
          />
          <span class="text-xs text-white mt-2">{{ skill.name }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const categories = [
  {
    name: "Frontend",
    skills: ["Vue.js", "Nuxt", "Next.js", "Tailwind", "TypeScript"],
  },
  {
    name: "Backend",
    skills: ["Laravel", "PHP", "Node.js", "Nest.js", "Python", "Microservices"],
  },
  {
    name: "Tools & Platforms",
    skills: ["Google Cloud Platform", "Git", "GitHub", "Figma", "Agile/Scrum"],
  },
];

const skills = [
  { name: "Vue.js", icon: "vuejs" },
  { name: "Nuxt", icon: "nuxtjs" },
  { name: "Next.js", icon: "nextjs" },
  { name: "Laravel", icon: "laravel" },
  { name: "PHP", icon: "php" },
  { name: "Node.js", icon: "nodejs" },
  // ... rest of your skills
];

const navigateToProjects = (skillName) => {
  router.push({
    path: "/projects",
    query: { skill: skillName },
  });
};
</script>

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
        learning Next.js and exploring new technologies that push the
        boundaries of web development.
      </p>
    </div>

    <!-- Technology Categories -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div
        v-for="(category, index) in categories"
        :key="index"
        class="bg-black/30 p-6 rounded-lg"
      >
        <h4 class="text-yellow-300 font-bold mb-4">{{ category.name }}</h4>
        <div class="flex flex-wrap gap-4">
          <div
            v-for="tech in category.tech"
            :key="tech.name"
            class="flex flex-col items-center group"
            :class="{
              'hover:scale-105 transition-transform cursor-pointer': tech.linkToProjects,
            }"
            @click="tech.linkToProjects && navigateToProjects(tech.name)"
          >
            <img
              :src="`/icons/${tech.icon}`"
              :alt="tech.name"
              class="h-8 w-8 mb-2"
              loading="lazy"
            />
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
      { name: "HTML", icon: "html.svg", linkToProjects: false },
      { name: "CSS", icon: "css.svg", linkToProjects: false },
      { name: "Jest", icon: "jest.svg", linkToProjects: false },
      { name: "Pinia", icon: "pinia.png", linkToProjects: false },
      { name: "NextJs", icon: "next.svg", linkToProjects: false },
    ],
  },
  {
    name: "Backend",
    tech: [
      { name: "Node.js", icon: "nodejs.svg", linkToProjects: true },
      { name: "NestJS", icon: "nest.svg", linkToProjects: true },
      { name: "Laravel", icon: "laravel.svg", linkToProjects: true },
      { name: "PHP", icon: "php.svg", linkToProjects: true },
      { name: "Python", icon: "python.svg", linkToProjects: true },
      { name: "Flask", icon: "flask.svg", linkToProjects: true },
      { name: "GraphQL", icon: "graphql.svg", linkToProjects: true },
      { name: "MySQL", icon: "database.svg", linkToProjects: true },
    ],
  },
  {
    name: "Tools & Infrastructure",
    tech: [
      { name: "Figma", icon: "figma.svg", linkToProjects: false },
      { name: "GCP", icon: "gcp.svg", linkToProjects: false },
      { name: "Git", icon: "git.svg", linkToProjects: false },
      { name: "GitLab", icon: "gitlab.svg", linkToProjects: false },
      { name: "VS Code", icon: "vscode.svg", linkToProjects: false },
      { name: "Netlify", icon: "netlify.svg", linkToProjects: false },
      { name: "npm", icon: "npm.svg", linkToProjects: false },
      { name: "Yarn", icon: "yarn.svg", linkToProjects: false },
      { name: "Yaml", icon: "yaml.svg", linkToProjects: false },
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

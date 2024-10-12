<template>
    <div class="projects-page">
      <h1>My Projects</h1>
      <div class="project-cards">
        <PokemonCard
          v-for="project in projects"
          :key="project.id"
          :name="project.name"
          :hp="project.hp"
          :energy-type="project.energyType"
          :energy-type-image="project.energyTypeImage"
          :image-url="project.imageUrl"
          :facts="project.facts"
        />
      </div>
    </div>
  </template>
  
  <script>
  import PokemonCard from '@/components/PokemonCard.vue'
  
  export default {
    components: {
      PokemonCard
    },
    data() {
      return {
        projects: [
          {
            id: 1,
            name: 'Vue Portfolio',
            hp: '100',
            energyType: 'Normal',
            energyTypeImage: 'http://res.cloudinary.com/bpettis/image/upload/v1516916046/firetype_otgmwq.png',
            imageUrl: 'http://25.media.tumblr.com/378e32d1bcde74880d177d4e31e4df72/tumblr_mu25vk7KRN1r91cn2o1_500.gif',
            facts: 'A responsive portfolio built with Vue and Tailwind'
          },
          // Add more project objects here
        ]
      }
    }
  }
  </script>
<template>
  <section class="w-full max-w-6xl px-4 my-10" aria-labelledby="skills-heading">
    <AtomsHeading id="skills-heading" text="What I do" :level="2" size="lg" variant="section" />
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <MoleculesSkillCard
        v-for="service in services"
        :key="service.id"
        :title="service.title"
        :description="service.shortDescription"
        :icon-path="service.iconPath"
        :featured="service.featured"
      />
    </div>
  </section>
</template>

<script setup>
import { services } from '~/data/services'
</script>

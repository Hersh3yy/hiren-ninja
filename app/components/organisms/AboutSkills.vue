<template>
  <section aria-labelledby="about-skills-heading">
    <AtomsHeading id="about-skills-heading" text="Skills & Focus" :level="2" size="xl" variant="page" />

    <div class="text-content mb-8">
      <p class="mb-4">
        I help creative professionals and growing businesses turn ideas into digital products,
        systems and experiences. My foundation is full-stack web development — from first concept
        through build, launch, and ongoing care — with AI and automation woven into the process,
        not bolted on as an afterthought.
      </p>
      <p class="mb-4">
        I work best as a genuine collaborator: learning how you think, understanding what matters
        to your audience, and translating that into technology that feels right — not just
        technology that technically works.
      </p>
    </div>

    <AtomsHeading text="How I work" :level="3" size="lg" variant="section" />
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <MoleculesValueCard
        v-for="value in values"
        :key="value.name"
        :title="value.name"
        :description="value.description"
      />
    </div>
  </section>
</template>

<script setup>
const values = Object.freeze([
  {
    name: 'Creative & technical',
    description: 'I speak both languages — I understand what you\'re trying to say creatively, and I know how to build the system that says it.'
  },
  {
    name: 'Close to the work',
    description: 'I stay involved, curious, and collaborative. Understanding how you think produces better work than just following a brief.'
  },
  {
    name: 'End to end',
    description: 'From first sketch and design through build, launch, and ongoing care — I see projects all the way through.'
  },
  {
    name: 'AI in practice',
    description: 'I use AI daily across my own work and for clients. No hype — just genuine leverage where it actually helps.'
  }
])
</script>

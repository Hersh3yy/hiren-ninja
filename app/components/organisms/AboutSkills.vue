<template>
  <div>
    <h2 class="page-title">Skills & Focus</h2>

    <div class="text-content mb-8">
      <p class="mb-4">
        My foundation is full-stack web development. I started in backend PHP, grew into Vue and Nuxt
        on the front end, and learned to see projects through end to end. That breadth is now in service
        of a sharper focus: integrating AI, automating operations, and engineering backends that scale.
      </p>
      <p class="mb-4">
        I work best where strategy meets implementation: identifying the manual work worth removing,
        the decisions worth augmenting with AI, and the systems worth hardening before they break.
      </p>
    </div>

    <h2 class="section-title">The four pillars</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="pillar in pillars" :key="pillar.name" class="card">
        <h4 class="text-accent font-bold mb-3">{{ pillar.name }}</h4>
        <p class="text-content-muted text-sm mb-4">{{ pillar.description }}</p>
        <div class="flex flex-wrap gap-2">
          <AtomsTag v-for="tech in pillar.tech" :key="tech" :label="tech" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const pillars = [
  {
    name: 'Website Development & Maintenance',
    description: 'Production front-ends and full-stack sites, built to last and kept healthy.',
    tech: ['Vue', 'Nuxt', 'TypeScript', 'Tailwind', 'Laravel', 'Node.js']
  },
  {
    name: 'A.I. Integration into Business',
    description: 'Putting LLMs and agents to work inside real operations.',
    tech: ['LLM APIs', 'Agents', 'RAG', 'Vector Search', 'Prompt Engineering']
  },
  {
    name: 'Workflow Automation',
    description: 'Removing manual, repetitive work with reliable automation.',
    tech: ['Job Queues', 'Event Pipelines', 'Webhooks', 'Schedulers', 'Integrations']
  },
  {
    name: 'High-Performance Backends',
    description: 'APIs and data layers that stay fast under real load.',
    tech: ['REST / GraphQL', 'PostgreSQL', 'Caching', 'Query Optimisation', 'GCP']
  }
]
</script>

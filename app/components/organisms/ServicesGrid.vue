<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <MoleculesServiceCard
        v-for="service in services"
        :key="service.id"
        v-bind="service"
        @start="openModal(service.id)"
      />
    </div>

    <OrganismsServiceModal
      :is-open="modalOpen"
      :service-type="selectedService"
      @close="modalOpen = false"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const services = [
  {
    id: 'website',
    title: 'Website Development & Maintenance',
    description:
      'Production-grade Nuxt/Vue sites and apps, built for performance and kept healthy with ongoing support and observability.',
    features: [
      'Custom Nuxt / Vue development',
      'Responsive, accessible design',
      'Performance & SEO optimisation',
      'Ongoing maintenance & monitoring'
    ]
  },
  {
    id: 'ai',
    title: 'A.I. Integration into Business',
    description:
      'Embedding LLMs, agents and semantic search into your existing operations so your team gets real leverage.',
    features: [
      'LLM & agent orchestration',
      'RAG & semantic search',
      'Custom AI tooling & assistants',
      'Evaluation & guardrails'
    ]
  },
  {
    id: 'automation',
    title: 'Workflow Automation',
    description:
      'Replacing manual, repetitive operations with reliable event-driven pipelines and background automation.',
    features: [
      'Event-driven pipelines',
      'Background job queues',
      'Third-party integrations',
      'Scheduled & AI-triggered actions'
    ]
  },
  {
    id: 'backend',
    title: 'High-Performance Backends',
    description:
      'Scalable APIs and data layers engineered to stay fast and reliable under real-world load.',
    features: [
      'Scalable API design',
      'Query & caching optimisation',
      'State machines & reliability',
      'Observability & tuning'
    ]
  }
]

const modalOpen = ref(false)
const selectedService = ref(null)

const openModal = (serviceId) => {
  selectedService.value = serviceId
  modalOpen.value = true
}

const handleSubmit = () => {
  modalOpen.value = false
}
</script>

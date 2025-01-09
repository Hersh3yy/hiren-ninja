# pages/services.vue
<template>
  <section class="min-h-screen">
    <div class="absolute inset-0 bg-grid-pattern"></div>
    <div class="container mx-auto px-4 sm:px-6 py-8 relative z-10">
      <h1 class="text-3xl sm:text-4xl font-bold text-yellow-300 mb-8">Professional Services</h1>
      <p class="text-gray-300 max-w-3xl mb-12">
        Delivering strategic technology solutions with precision and expertise. We focus on understanding your business
        objectives and creating lasting value through thoughtful implementation.
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ServiceCard v-for="service in services" :key="service.id" v-bind="service" @start="openModal(service.id)" />
      </div>

      <ServiceModal :is-open="modalOpen" :service-type="selectedService" @close="modalOpen = false"
        @submit="handleSubmit" />
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const services = ref([
  {
    id: 'discovery',
    title: 'Discovery & Consultation',
    description: 'Together we\'ll uncover your project\'s true potential. Drawing from years of experience, I\'ll help you navigate the technical landscape and forge a path that serves your vision.',
    features: [
      'Understanding your needs',
      'Technology recommendations',
      'Project planning',
      'Cost estimation'
    ]
  },
  {
    id: 'website',
    title: 'Website Development',
    description: 'Get your business online with a website that means business. From sleek landing pages to full-featured online stores, I build digital experiences that work as hard as you do.',
    features: [
      'Custom design',
      'Mobile friendly',
      'Easy to update',
      'Search engine optimized'
    ]
  },
  {
    id: 'application',
    title: 'Web Applications',
    description: 'Custom software crafted with precision to streamline your operations. Transform your workflows into efficient digital systems that give you the edge in today\'s market.',
    features: [
      'Custom software solutions',
      'Business automation',
      'Data management',
      'Cloud hosting'
    ]
  },
  {
    id: 'maintenance',
    title: 'Maintenance & Support',
    description: 'Keep your digital assets performing at their peak. With vigilant monitoring and swift response times, I ensure your systems stay sharp and ready for action.',
    features: [
      'Regular updates',
      'Problem solving',
      'Performance improvements',
      'Technical support'
    ]
  }
])

const modalOpen = ref(false)
const selectedService = ref(null)

const openModal = (serviceId) => {
  selectedService.value = serviceId
  modalOpen.value = true
}

const handleSubmit = async (formData) => {
  try {
    console.log('Processing request:', formData)
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('Request submitted successfully')
    modalOpen.value = false
  } catch (error) {
    console.error('Error:', error)
    alert('Request failed. Please try again.')
  }
}
</script>

<style scoped>
.bg-grid-pattern {
  background-image: linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  background-color: rgba(0, 0, 0, 0.8);
}
</style>
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
useSeoMeta({
  title: 'Professional Services - Hiren',
  ogTitle: 'Professional Services - Hiren',
  description: 'Delivering strategic technology solutions with precision and expertise.',
  ogDescription: 'We focus on understanding your business objectives and creating lasting value through thoughtful implementation.',
  ogImage: '/path/to/service-image.jpg',
  twitterCard: 'summary_large_image',
})

const services = ref([
  {
    id: 'discovery',
    title: 'Discovery & Planning',
    description: 'A strategic approach to understanding business needs and crafting the right technical solution. Each discovery session focuses on identifying opportunities for efficiency and growth.',
    features: [
      'Business process analysis',
      'Technical requirements gathering',
      'Solution architecture planning',
      'Timeline and cost estimation'
    ]
  },
  {
    id: 'website',
    title: 'Site Development',
    description: 'Modern, efficient websites built with proven technologies. From corporate platforms to dynamic web applications, each solution is crafted for performance and scalability.',
    features: [
      'Custom website development',
      'Responsive design implementation',
      'Performance optimization',
      'Search engine readiness'
    ]
  },
  {
    id: 'application',
    title: 'Application Development',
    description: 'Specialized expertise in joining existing development teams or building new applications from the ground up. Focus on clean code, clear documentation, and seamless integration.',
    features: [
      'Custom application development',
      'Existing system integration',
      'Team augmentation',
      'Technical documentation'
    ]
  },
  {
    id: 'maintenance',
    title: 'Maintenance & Support',
    description: 'Proactive maintenance and responsive support to ensure digital assets remain secure and efficient. Regular updates and improvements keep systems running at peak performance.',
    features: [
      'Ongoing system maintenance',
      'Performance monitoring',
      'Security updates',
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
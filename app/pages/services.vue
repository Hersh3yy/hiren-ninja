# pages/services.vue
<template>
  <section class="min-h-screen">
    <div class="absolute inset-0 bg-grid-pattern"></div>
    <div class="container mx-auto px-4 sm:px-6 py-8 relative z-10">
      <h1 class="text-3xl sm:text-4xl font-bold text-yellow-300 mb-8">Services</h1>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ServiceCard title="Discovery & Consultation"
          description="Let's discuss your project needs and create a plan that works for you. I'll help you understand the tech that fits your business."
          :features="[
            'Understanding your needs',
            'Technology recommendations',
            'Project planning',
            'Cost estimation'
          ]" @start="openModal('discovery')" />

        <ServiceCard title="Website Development"
          description="Get your business online with a professional website. From simple business sites to online stores."
          :features="[
            'Custom design',
            'Mobile friendly',
            'Easy to update',
            'Search engine optimized'
          ]" @start="openModal('website')" />

        <ServiceCard title="Web Applications"
          description="Custom software to help run your business better. Automate tasks and manage your data efficiently."
          :features="[
            'Custom software solutions',
            'Business automation',
            'Data management',
            'Cloud hosting'
          ]" @start="openModal('application')" />

        <ServiceCard title="Maintenance & Support"
          description="Keep your website or application running smoothly. Regular updates and fixes when you need them."
          :features="[
            'Regular updates',
            'Problem solving',
            'Performance improvements',
            'Technical support'
          ]" @start="openModal('maintenance')" />
      </div>

      <ServiceModal :is-open="modalOpen" :service-type="selectedService" @close="modalOpen = false"
        @submit="handleSubmit" />
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';

const modalOpen = ref(false);
const selectedService = ref(null);

const openModal = (serviceType) => {
  selectedService.value = serviceType;
  modalOpen.value = true;
};

const handleSubmit = async (formData) => {
  try {
    console.log('Sending form data:', formData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Request sent successfully!');
    modalOpen.value = false;
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to send request. Please try again.');
  }
};
</script>

<style scoped>
.bg-grid-pattern {
  background-image: linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  background-color: rgba(0, 0, 0, 0.8);
}
</style>
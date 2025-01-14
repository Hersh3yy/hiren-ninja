<!-- components/landing/LandingSkills.vue -->
<template>
    <section class="w-full max-w-6xl px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="skill in skills" :key="skill.title"
                class="p-6 bg-black/20 rounded-lg border border-yellow-300/20 hover:border-yellow-300/40 transition-all">
                <h3 class="text-xl text-yellow-300 mb-3">{{ skill.title }}</h3>
                <p class="text-gray-300">{{ skill.description }}</p>
            </div>
        </div>
    </section>
</template>

<script setup>
const skills = ref([
    {
        title: "Web Development",
        description: "Custom websites and applications built with modern technologies and balanced architecture, focused on serving your business needs."
    },
    {
        title: "Data Visualization",
        description: "Transforming complex data into clear, actionable insights through effective visualization and thoughtful presentation."
    },
    {
        title: "Data-Driven Applications",
        description: "Building robust, purpose-driven applications that harness your data's full potential with technical precision."
    },
    {
        title: "Website Maintenance",
        description: "Consistent, attentive maintenance ensuring your digital platforms remain performant and secure as technology evolves."
    }
]);
</script>
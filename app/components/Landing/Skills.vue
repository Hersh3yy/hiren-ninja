<!-- components/landing/LandingSkills.vue -->
<template>
    <section class="w-full max-w-6xl px-4 my-10">
        <h2 class="section-title">My Skills</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="skill in skills" :key="skill.title"
                class="p-6 bg-black/80 rounded-lg border-4 border-yellow-300/20 hover:border-yellow-300/40 transition-all">
                <div class="gif-container mb-4">
                    <div v-html="skill.embedCode" class="gif-embed"></div>
                </div>
                <h3 class="text-xl text-yellow-300 mb-3">{{ skill.title }}</h3>
                <p class="text-gray-300">{{ skill.description }}</p>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const skills = ref([
    {
        title: "Web Development",
        description: "Custom websites and applications built with modern technologies and balanced architecture, focused on serving your business needs.",
        embedCode: `<div class="tenor-gif-embed" data-postid="13270512" data-share-method="host" data-aspect-ratio="1.32773" data-width="100%"><a href="https://tenor.com/view/web-webdevelopper-developper-computer-kid-computer-gif-13270512">Web Webdevelopper GIF</a></div>`,
    },
    {
        title: "Data Visualization",
        description: "Transforming complex data into clear, actionable insights through effective visualization and thoughtful presentation.",
        embedCode: `<div class="tenor-gif-embed" data-postid="16140524" data-share-method="host" data-aspect-ratio="1" data-width="100%"><a href="https://tenor.com/view/laplace-laplace-equation2d-finite-difference-method-python-matplotlib-gif-16140524">Laplace Laplace Equation2d GIF</a></div>`,
    },
    {
        title: "Data-Driven Applications",
        description: "Building robust, purpose-driven applications that harness your data's full potential with technical precision.",
        embedCode: `<div class="tenor-gif-embed" data-postid="8591210658048230749" data-share-method="host" data-aspect-ratio="1" data-width="100%"><a href="https://tenor.com/view/gofiber-really-domixi-gif-8591210658048230749">Gofiber Really GIF</a></div>`,
    },
    {
        title: "Website Maintenance",
        description: "Consistent, attentive maintenance ensuring your digital platforms remain performant and secure as technology evolves.",
        embedCode: `<div class="tenor-gif-embed" data-postid="22805352" data-share-method="host" data-aspect-ratio="1" data-width="100%"><a href="https://tenor.com/view/klm-aviation-aircraft-airline-royal-dutch-airlines-gif-22805352">Klm Aviation GIF</a></div>`,
    }
]);

onMounted(() => {
    const script = document.createElement('script');
    script.src = "https://tenor.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
});
</script>

<style scoped>
.gif-container {
    width: 100%;
    height: 180px;
    overflow: hidden;
    position: relative;
    border-radius: 0.5rem;
    background: rgba(0, 0, 0, 0.5);
}

.gif-embed {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.tenor-gif-embed {
    max-width: 100%;
    max-height: 100%;
}

/* Hide Tenor attribution links */
.tenor-gif-embed a {
    display: none;
}
</style>
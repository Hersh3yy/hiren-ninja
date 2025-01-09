<template>
    <div class="skills-section mt-12 px-4 sm:px-8">
        <h2 class="section-title">My Skills</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div v-for="skill in skills" :key="skill.title" class="card">
                <div class="gif-container">
                    <div v-html="skill.embedCode" class="gif-embed"></div>
                </div>
                <h3 class="text-xl font-semibold text-white mt-3">{{ skill.title }}</h3>
                <p class="text-gray-300">{{ skill.description }}</p>
            </div>
        </div>
        <NuxtLink to="/services" class="mt-6 mb-3 inline-block text-yellow-300 hover:text-yellow-400">Learn more about my
            services</NuxtLink>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const skills = ref([
    {
        title: "Web Development",
        description: "Custom websites for businesses and individuals.",
        embedCode: `<div class="tenor-gif-embed" data-postid="13270512" data-share-method="host" data-aspect-ratio="1.32773" data-width="100%"><a href="https://tenor.com/view/web-webdevelopper-developper-computer-kid-computer-gif-13270512">Web Webdevelopper GIF</a> from <a href="https://tenor.com/search/web-gifs">Web GIFs</a></div>`,
    },
    {
        title: "Data Visualization",
        description: "Communicate complex data effectively.",
        embedCode: `<div class="tenor-gif-embed" data-postid="16140524" data-share-method="host" data-aspect-ratio="1" data-width="100%"><a href="https://tenor.com/view/laplace-laplace-equation2d-finite-difference-method-python-matplotlib-gif-16140524">Laplace Laplace Equation2d GIF</a> from <a href="https://tenor.com/search/laplace-gifs">Laplace GIFs</a></div>`,
    },
    {
        title: "Data-Dependent Applications",
        description: "Build applications that rely on data and/or AI.",
        embedCode: `<div class="tenor-gif-embed" data-postid="8591210658048230749" data-share-method="host" data-aspect-ratio="1" data-width="100%"><a href="https://tenor.com/view/gofiber-really-domixi-gif-8591210658048230749">Gofiber Really GIF</a> from <a href="https://tenor.com/search/gofiber-gifs">Gofiber GIFs</a></div>`,
    },
    {
        title: "Website Maintenance & Renewal",
        description: "Maintain live websites and renew old projects.",
        embedCode: `<div class="tenor-gif-embed" data-postid="22805352" data-share-method="host" data-aspect-ratio="1" data-width="100%"><a href="https://tenor.com/view/klm-aviation-aircraft-airline-royal-dutch-airlines-gif-22805352">Klm Aviation GIF</a> from <a href="https://tenor.com/search/klm-gifs">Klm GIFs</a></div>`,
    },
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
    height: 222px;
    overflow: hidden;
    position: relative;
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
</style>
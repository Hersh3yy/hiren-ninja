<template>
  <div class="flex flex-col space-y-2">
    <button
      v-for="sound in sounds"
      :key="sound.name"
      @click="toggleSound(sound)"
      class="px-4 py-2 font-semibold text-white rounded-lg shadow-md transition-colors duration-300 w-24"
      :class="
        sound.isPlaying
          ? 'bg-purple-600 hover:bg-purple-500'
          : 'bg-gray-700 hover:bg-gray-600'
      "
    >
      {{ sound.name }}
      <span class="ml-2">{{ sound.isPlaying ? "🔊" : "🔇" }}</span>
    </button>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

interface Sound {
  name: string;
  audioSrc: string;
  audio?: HTMLAudioElement;
  isPlaying: boolean;
}

const sounds = ref<Sound[]>([
  {
    name: "Bass",
    audioSrc: "/sounds/bass.mp3",
    isPlaying: false,
  },
  {
    name: "Treble",
    audioSrc: "/sounds/hi-hat.mp3",
    isPlaying: false,
  },
  {
    name: "Mids",
    audioSrc: "/sounds/arp.mp3",
    isPlaying: false,
  },
]);

const toggleSound = (sound: Sound) => {
  if (!sound.audio) return;

  if (sound.isPlaying) {
    sound.audio.pause();
    sound.audio.currentTime = 0;
    sound.isPlaying = false;
  } else {
    sound.audio.play();
    sound.isPlaying = true;
  }
};

// Set up audio objects and looping on client-side only
onMounted(() => {
  sounds.value.forEach((sound) => {
    sound.audio = new Audio(sound.audioSrc);
    sound.audio.loop = true;
  });
});

// Clean up audio objects when component is unmounted
onUnmounted(() => {
  sounds.value.forEach((sound) => {
    if (sound.audio) {
      sound.audio.pause();
      sound.audio.src = "";
    }
  });
});
</script>

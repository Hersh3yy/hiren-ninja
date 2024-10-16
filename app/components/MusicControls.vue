<template>
  <div class="fixed bottom-4 right-4 flex space-x-2">
    <button
      v-for="sound in sounds"
      :key="sound.name"
      @click="toggleSound(sound)"
      class="w-10 h-10 rounded-full bg-white text-black font-bold flex items-center justify-center transition-colors duration-300"
      :class="sound.isPlaying ? 'bg-yellow-300' : 'hover:bg-gray-200'"
    >
      {{ sound.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

interface Sound {
  name: string;
  label: string;
  audioSrc: string;
  audio?: HTMLAudioElement;
  isPlaying: boolean;
}

const sounds = ref<Sound[]>([
  {
    name: "Bass",
    label: "L",
    audioSrc: "/sounds/bass.mp3",
    isPlaying: false,
  },
  {
    name: "Mids",
    label: "M",
    audioSrc: "/sounds/arp.mp3",
    isPlaying: false,
  },
  {
    name: "Treble",
    label: "H",
    audioSrc: "/sounds/hi-hat.mp3",
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

onMounted(() => {
  sounds.value.forEach((sound) => {
    sound.audio = new Audio(sound.audioSrc);
    sound.audio.loop = true;
  });
});

onUnmounted(() => {
  sounds.value.forEach((sound) => {
    if (sound.audio) {
      sound.audio.pause();
      sound.audio.src = "";
    }
  });
});
</script>

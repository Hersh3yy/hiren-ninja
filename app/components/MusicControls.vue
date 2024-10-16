<template>
  <div class="fixed bottom-4 right-4 flex space-x-2">
    <button
      @click="toggleMute"
      class="w-10 h-10 rounded-full bg-white text-black font-bold flex items-center justify-center transition-colors duration-300 hover:bg-gray-200"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        :class="['h-6 w-6', isMuted ? 'text-red-500' : 'text-black']"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
        />
        <path
          v-if="isMuted"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 3l18 18"
        />
      </svg>
    </button>
    <button
      v-for="sound in sounds"
      :key="sound.name"
      v-show="!isMuted"
      @click="toggleSound(sound)"
      class="w-10 h-10 rounded-full bg-white text-black font-bold flex items-center justify-center transition-colors duration-300"
      :class="sound.isPlaying ? 'bg-yellow-300' : 'hover:bg-gray-200'"
    >
      {{ sound.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";

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

const isMuted = ref(false);

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

const toggleMute = () => {
  isMuted.value = !isMuted.value;
  sounds.value.forEach((sound) => {
    if (sound.audio) {
      sound.audio.muted = isMuted.value;
      if (isMuted.value) {
        sound.audio.pause();
        sound.isPlaying = false;
      }
    }
  });
};

watch(isMuted, (newValue) => {
  if (!newValue) {
    sounds.value.forEach((sound) => {
      if (sound.audio && sound.isPlaying) {
        sound.audio.play();
      }
    });
  }
});

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

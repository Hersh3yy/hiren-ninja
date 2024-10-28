<template>
  <div class="fixed bottom-4 right-4 flex space-x-2 z-50">
    <button
      @click="toggleMute"
      class="w-10 h-10 rounded-full bg-white text-black font-bold flex items-center justify-center transition-colors duration-300 hover:bg-gray-200"
      :class="{ 'highlight-animation': showInitialAnimation }"
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
      v-for="(sound, index) in sounds"
      :key="sound.name"
      v-show="!isMuted"
      @click="toggleSound(sound)"
      class="w-10 h-10 rounded-full bg-white text-black font-bold flex items-center justify-center transition-colors duration-300"
      :class="{
        'bg-yellow-300': sound.isPlaying,
        'hover:bg-gray-200': !sound.isPlaying,
        'highlight-animation': showInitialAnimation,
        [`highlight-delay-${index + 1}`]: showInitialAnimation,
      }"
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
  buffer?: AudioBuffer;
  source?: AudioBufferSourceNode;
  gainNode?: GainNode;
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
let audioContext: AudioContext | null = null;
let startTime: number | null = null;

const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
};

const loadAudioBuffers = async () => {
  for (const sound of sounds.value) {
    const response = await fetch(sound.audioSrc);
    const arrayBuffer = await response.arrayBuffer();
    sound.buffer = await audioContext!.decodeAudioData(arrayBuffer);
  }
};

const startAudio = () => {
  if (!startTime) {
    startTime = audioContext!.currentTime;
  }
};

const toggleSound = (sound: Sound) => {
  initAudioContext();
  startAudio();

  if (sound.isPlaying) {
    if (sound.gainNode) {
      sound.gainNode.gain.setValueAtTime(0, audioContext!.currentTime);
    }
    sound.isPlaying = false;
  } else {
    if (!sound.source && sound.buffer) {
      sound.source = audioContext!.createBufferSource();
      sound.source.buffer = sound.buffer;
      sound.source.loop = true;

      sound.gainNode = audioContext!.createGain();
      sound.source.connect(sound.gainNode);
      sound.gainNode.connect(audioContext!.destination);

      const loopDuration = sound.buffer.duration;
      const currentTime = audioContext!.currentTime;
      const timeSinceStart = currentTime - startTime!;
      const offset = timeSinceStart % loopDuration;

      sound.source.start(0, offset);
    }

    if (sound.gainNode) {
      sound.gainNode.gain.setValueAtTime(1, audioContext!.currentTime);
    }
    sound.isPlaying = true;
  }
};

const toggleMute = () => {
  isMuted.value = !isMuted.value;
  sounds.value.forEach((sound) => {
    if (sound.gainNode) {
      sound.gainNode.gain.setValueAtTime(
        isMuted.value ? 0 : sound.isPlaying ? 1 : 0,
        audioContext!.currentTime
      );
    }
  });
};

const showInitialAnimation = ref(false);

onMounted(async () => {
  initAudioContext();
  await loadAudioBuffers();

  // Start animation after a short delay
  setTimeout(() => {
    showInitialAnimation.value = true;
  }, 1000);

  // Remove animation class after it's done
  setTimeout(() => {
    showInitialAnimation.value = false;
  }, 4000); // Adjust timing based on your animation duration
});

onUnmounted(() => {
  sounds.value.forEach((sound) => {
    if (sound.source) {
      sound.source.stop();
    }
  });
  if (audioContext) {
    audioContext.close();
  }
});
</script>
<style scoped>
@keyframes highlightButton {
  0%,
  100% {
    background-color: white;
  }
  25%,
  75% {
    background-color: #fde047; /* Tailwind yellow-300 */
  }
}

.highlight-animation {
  animation: highlightButton 1s ease-in-out 2;
}

.highlight-delay-1 {
  animation-delay: 0.4s;
}

.highlight-delay-2 {
  animation-delay: 0.8s;
}

.highlight-delay-3 {
  animation-delay: 1.2s;
}

/* Optional: Add transitions for smoother color changes */
button {
  transition: background-color 0.2s ease-in-out;
}
</style>

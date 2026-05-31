<template>
  <NuxtLink :to="to" class="nav-link text-content hover:text-accent transition-colors duration-200">
    {{ text }}
  </NuxtLink>
</template>

<script setup>
defineProps({
  to: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.nav-link {
  position: relative;
  cursor: pointer;
}

.nav-link::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background-color: theme("colors.accent.DEFAULT");
  transition: width 0.2s ease;
  pointer-events: none;
}

.nav-link:hover::after {
  width: 100%;
}
</style>

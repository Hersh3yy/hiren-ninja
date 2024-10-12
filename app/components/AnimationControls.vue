<template>
    <div class="bg-black min-h-screen flex flex-col relative">
      <div class="max-w-screen-xl w-full mx-auto my-8">
        <NuxtPage />
      </div>
      <div class="fixed bottom-4 left-4 flex space-x-2">
        <MusicControls />
        <AnimationControls />
      </div>
    </div>
  </template>
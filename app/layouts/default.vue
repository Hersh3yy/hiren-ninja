<template>
  <div
    class="bg-black min-h-screen flex flex-col relative font-[Space_Grotesk]"
  >
    <FractalClockBackground />
    <Header />

    <main
      class="flex-grow flex justify-center items-start z-10 mt-16 w-full max-w-full"
    >
      <NuxtPage />
    </main>

    <div class="fixed bottom-4 left-4 z-10">
      <MusicControls />
    </div>

    <Footer class="mt-auto" />
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Sixtyfour+Convergence:SCAN,XELA,YELA@-16,60,-94&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap");

:root {
  font-family: "Space Grotesk", sans-serif;
}
</style>

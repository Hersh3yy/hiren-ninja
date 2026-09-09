<template>
  <div class="max-w-3xl text-center px-4 my-32">
    <p class="text-xs sm:text-sm uppercase tracking-[0.3em] text-content-muted mb-6">
      Software · AI &amp; Automation · For creative businesses
    </p>
    <h1 class="text-3xl md:text-4xl lg:text-5xl text-content leading-tight font-semibold pt-8">
      Technology for
      <span class="accent-phrase">creative businesses</span>.
    </h1>
    <p class="mt-6 text-base md:text-lg text-content-muted">
      Websites, software, automation and AI that help artists, designers, agencies and growing businesses work smarter and communicate their ideas better.
    </p>
  </div>
</template>

<style scoped>
.accent-phrase {
  font-weight: 700;
  color: theme('colors.accent.DEFAULT');
  background-image: linear-gradient(
    to right,
    theme('colors.accent.DEFAULT'),
    theme('colors.accent.hover')
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

@supports not (background-clip: text) {
  .accent-phrase {
    color: theme('colors.accent.DEFAULT');
    background-image: none;
  }
}
</style>

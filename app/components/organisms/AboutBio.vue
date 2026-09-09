<template>
  <section class="mb-12" aria-labelledby="about-bio-heading">
    <AtomsHeading id="about-bio-heading" text="Biography" :level="2" size="xl" variant="page" />
    <div class="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
      <div class="w-full md:w-1/3 flex justify-center mb-6 md:mb-0">
        <img
          src="/mugshot.jpg"
          alt="Portrait of Hiren"
          class="w-48 sm:w-64 h-auto object-cover rounded-lg shadow-lg border-2 border-accent"
          loading="lazy"
        >
      </div>
      <div class="w-full md:w-2/3 text-content text-sm sm:text-base">
        <p class="mb-3 sm:mb-4">
          Hi, I'm Hiren. I'm a developer who specialises in translating creative ideas into
          technology. Originally from Sint Maarten and now based in Amsterdam, I work with
          artists, designers, photographers, musicians, founders and growing businesses — people
          who know exactly what they want to say, and need a technical partner who gets it.
        </p>
        <p class="mb-3 sm:mb-4">
          That's the thread connecting all of them: they have vision, I provide execution. I
          speak both creative and technical, and I think that combination is genuinely rare. My
          interest in music, art, and what makes things resonate is the reason I'm right for this
          kind of work — not just someone who can build it, but someone who understands why it
          matters.
        </p>
        <p class="mb-3 sm:mb-4">
          On the technical side, I started in backend PHP, grew into full-stack work with Vue and
          Nuxt, and now use AI daily — to work faster, experiment more, and spend the time I save
          on craft and collaboration. I care about design, UX, and seeing a project through from
          first sketch to launch and beyond.
        </p>
        <p>
          Outside of client work I produce music and DJ techno. Amsterdam's overlap of tech and
          music culture is exactly why I ended up here, and it keeps both sides of my brain sharp.
        </p>
      </div>
    </div>
  </section>
</template>

<template>
  <div>
    <h2 class="page-title">Skills & Focus</h2>

    <div class="text-content mb-8">
      <p class="mb-4">
        My foundation is full-stack web development, end to end: from the first idea and the design,
        through building it, to launching and looking after it. AI and automation are a big part of
        how I work now, but they're tools in service of the product, not the whole story.
      </p>
      <p class="mb-4">
        I work best where strategy meets craft, and I genuinely enjoy the human side: brainstorming
        with you and your team, learning how you think, and shaping something we're both proud of.
      </p>
    </div>

    <h2 class="section-title">How I work</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="value in values" :key="value.name" class="card">
        <h4 class="text-accent font-bold mb-2">{{ value.name }}</h4>
        <p class="text-content-muted text-sm">{{ value.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const values = [
  {
    name: 'Design & UX',
    description: 'I care how things look and feel, not just whether they work. Good design is part of the job.'
  },
  {
    name: 'Close to the customer',
    description: 'I love brainstorming requirements with you. Understanding how a different person thinks makes the product better.'
  },
  {
    name: 'End to end',
    description: 'From first sketch and design through build, launch, and ongoing care, I see projects all the way through.'
  },
  {
    name: 'Always learning',
    description: 'I keep up with the latest tech, tools, and standards, and use AI to work faster and smarter.'
  }
]
</script>

<template>
  <section class="w-full max-w-6xl px-4 my-10">
    <h2 class="section-title">What I do</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <MoleculesSkillCard
        v-for="skill in skills"
        :key="skill.title"
        :title="skill.title"
        :description="skill.description"
        :icon-path="skill.iconPath"
        :featured="skill.featured"
      />
    </div>
  </section>
</template>

<script setup>
const skills = [
  {
    title: 'Web Development & Maintenance',
    description:
      'I think with you to figure out your needs, then deliver a modern, fast digital presence — and keep it healthy over time.',
    iconPath: 'M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5',
    featured: true
  },
  {
    title: 'A.I. Integration into Business',
    description:
      'Feasible? Let\'s see how artificial intelligence can help you reach your goals — while staying human.',
    iconPath:
      'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z',
    featured: false
  },
  {
    title: 'Workflow Automation',
    description:
      'Add smart automation to your processes and create time you can spend elsewhere.',
    iconPath:
      'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99',
    featured: false
  },
  {
    title: 'High-Performance Backends',
    description:
      'Secure storing, updating, and serving of your data — right where it needs to be.',
    iconPath:
      'M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3',
    featured: true
  }
]
</script>

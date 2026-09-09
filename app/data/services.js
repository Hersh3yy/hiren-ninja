/**
 * Single source of truth for service offerings across SkillsGrid, ServicesGrid, and ServiceModal.
 */
export const services = Object.freeze([
  {
    id: 'website',
    title: 'Websites & Digital Experiences',
    shortDescription:
      'A fast, modern digital presence built around what you actually want to say — and who you want to say it to.',
    description:
      'A fast, beautiful digital presence that tells your story the way you want it told — and keeps working for you long after launch.',
    features: Object.freeze([
      'Portfolio sites for photographers, designers & artists',
      'Built around who you are and who you\'re talking to',
      'Looks and feels right on every device',
      'Easy to update, easy to hand off'
    ]),
    iconPath: 'M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5',
    featured: true,
    modalPlaceholder:
      'Tell me about the site or app you have in mind: what it should say, who it\'s for, and how you want people to feel when they land on it.'
  },
  {
    id: 'ai',
    title: 'Practical AI That Saves Time',
    shortDescription:
      'AI woven into the way you already work — speeding up research, content, and decisions without losing the human touch.',
    description:
      'AI built into the way you already work — not a gimmick, but a genuine time-saver that keeps you in control.',
    features: Object.freeze([
      'Speed up research, writing, and content creation',
      'Automate repetitive decisions and lookups',
      'Always keep a human in the loop',
      'No hype, just real leverage'
    ]),
    iconPath:
      'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z',
    featured: false,
    modalPlaceholder:
      'Describe where your time gets eaten up. What decisions, research, or content are slow or repetitive today?'
  },
  {
    id: 'automation',
    title: 'Remove Repetitive Work',
    shortDescription:
      'Connect the tools you already use and let the boring stuff run itself — so your time goes where it matters.',
    description:
      'Connect the tools you already use and let the routine stuff run itself — so your energy goes into the work that actually matters.',
    features: Object.freeze([
      'Auto-generate release schedules, invoices, or reports',
      'Connect booking, CRM, and communication tools',
      'Trigger notifications and handoffs automatically',
      'Free up hours every single week'
    ]),
    iconPath:
      'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99',
    featured: false,
    modalPlaceholder:
      'Walk me through the manual process you want gone — what triggers it, what tools are involved, and what the end result should be.'
  },
  {
    id: 'backend',
    title: 'Reliable Systems That Scale',
    shortDescription:
      'The engine under the hood — secure, fast, and built to grow with you without breaking down when it matters most.',
    description:
      'The engine under the hood — secure, fast, and built to grow with your business without breaking when it matters most.',
    features: Object.freeze([
      'Your data stored securely and accessed quickly',
      'APIs that connect your tools and platforms',
      'Scales as your audience and business grow',
      'Built to last, not just to ship'
    ]),
    iconPath:
      'M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3',
    featured: true,
    modalPlaceholder:
      'Describe what you\'re building or running: current pain points, how it needs to grow, and what\'s most important to you.'
  }
])

export function getServiceById(id) {
  return services.find((service) => service.id === id) || null
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/components/**/*.{js,vue,ts}",
    "./app/layouts/**/*.vue",
    "./app/pages/**/*.vue",
    "./app/plugins/**/*.{js,ts}",
    "./app/error.vue",
  ],
  theme: {
    extend: {
      colors: {
        // Surface tokens (dark zinc scale)
        ink: "#09090b", // zinc-950 - page background (named "ink" to avoid clashing with text-base font-size utility)
        surface: "#18181b", // zinc-900 - cards / panels
        elevated: "#27272a", // zinc-800 - raised elements
        // Border tokens
        "border-subtle": "#27272a", // zinc-800
        "border-default": "#3f3f46", // zinc-700
        // Brand accent (yellow)
        accent: {
          DEFAULT: "#fde047", // yellow-300
          hover: "#facc15", // yellow-400
          muted: "rgb(253 224 71 / 0.4)",
        },
        // Text tokens
        content: {
          DEFAULT: "#f4f4f5", // zinc-100 - primary text
          muted: "#a1a1aa", // zinc-400 - secondary text
        },
      },
      fontFamily: {
        "space-grotesk": ["Space Grotesk", "sans-serif"],
        sixtyfour: ["Sixtyfour Convergence", "sans-serif"],
      },
    },
  },
  plugins: [],
};

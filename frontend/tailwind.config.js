/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,jsx}", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        panel: "var(--panel)",
        "panel-alt": "var(--panel-alt)",
        "panel-raised": "var(--panel-raised)",
        gridline: "var(--grid-line)",
        primary: "var(--text-primary)",
        dim: "var(--text-dim)",
        faint: "var(--text-faint)",
        cyan: "var(--accent-cyan)",
        amber: "var(--accent-amber)",
        coral: "var(--accent-coral)",
        violet: "var(--accent-violet)",
      },
      fontFamily: {
        ui: ["Space Grotesk", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

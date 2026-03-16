/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./providers/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        app: {
          bg: "#f3fbff",
          "bg-dark": "#071823",
          surface: "#ffffff",
          "surface-dark": "#0d2535",
          "surface-elevated": "#e8f6ff",
          "surface-elevated-dark": "#15364b",
          fg: "#406179",
          "fg-dark": "#e6f7ff",
          "muted-fg": "#6b8aa1",
          "muted-fg-dark": "#8fb2c8",
          primary: "#0ea5e9",
          "primary-dark": "#22d3ee",
          "primary-fg": "#ffffff",
          "primary-fg-dark": "#083344",
          border: "#cfe5f2",
          "border-dark": "#21455d",
        },
        background: "#f3fbff",
        foreground: "#406179",
        primary: {
          DEFAULT: "#0ea5e9",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#e8f6ff",
          foreground: "#406179",
        },
        destructive: {
          DEFAULT: "#fb7185",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#e8f6ff",
          foreground: "#6b8aa1",
        },
        accent: {
          DEFAULT: "#e8f6ff",
          foreground: "#406179",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#406179",
        },
        border: "#cfe5f2",
        input: "#cfe5f2",
        ring: "#22d3ee",
      },
    },
  },
  plugins: [],
};

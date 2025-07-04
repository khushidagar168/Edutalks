/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],

extend: {
  animation: {
    blob: "blob 7s infinite",
    "fade-in": "fadeIn 1s ease-out",
    "slide-up": "slideUp 1s ease-out",
    "fade-in-up": "fadeInUp 1s ease-out",
  },
  keyframes: {
    blob: {
      "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
      "33%": { transform: "translate(30px, -50px) scale(1.1)" },
      "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
    },
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    slideUp: {
      from: { transform: "translateY(20px)", opacity: 0 },
      to: { transform: "translateY(0)", opacity: 1 },
    },
    fadeInUp: {
      from: { opacity: 0, transform: "translateY(20px)" },
      to: { opacity: 1, transform: "translateY(0px)" },
    },
  },
},
}
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // Primary — Ocean Blue
        brand: {
          50:  "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        // Secondary — Nature Green
        nature: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        // Accent — Sunset Orange
        sunset: {
          50:  "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        card:       "0 2px 16px 0 rgba(14,165,233,0.06)",
        "card-hover":"0 8px 32px 0 rgba(14,165,233,0.15)",
        glow:       "0 0 30px rgba(14,165,233,0.25)",
        "glow-green":"0 0 30px rgba(34,197,94,0.25)",
        glass:      "0 8px 32px 0 rgba(14,165,233,0.08), inset 0 1px 0 rgba(255,255,255,0.5)",
      },
      animation: {
        "fade-in":      "fadeIn 0.45s ease-out both",
        "slide-up":     "slideUp 0.5s ease-out both",
        "slide-in-left":"slideInLeft 0.4s ease-out both",
        "slide-right":  "slideInRight 0.4s ease-out both",
        shimmer:        "shimmer 1.4s infinite linear",
        "float":        "float 3.5s ease-in-out infinite",
        "pulse-soft":   "pulseSoft 2s ease-in-out infinite",
        "spin-slow":    "spin 3s linear infinite",
        "zoom-bg":      "zoomBg 14s ease-in-out infinite",
        "glow-pulse":   "glowPulse 5s ease-in-out infinite",
        "border-glow":  "borderGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%":   { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-700px 0" },
          "100%": { backgroundPosition:  "700px 0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%":     { transform: "translateY(-8px)" },
        },
        pulseSoft: {
          "0%,100%": { opacity: "1", transform: "scale(1)" },
          "50%":     { opacity: "0.5", transform: "scale(0.85)" },
        },
        zoomBg: {
          "0%,100%": { transform: "scale(1)" },
          "50%":     { transform: "scale(1.05)" },
        },
        slideInRight: {
          "0%":   { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        glowPulse: {
          "0%,100%": { opacity: "0.5", transform: "scale(1)" },
          "50%":     { opacity: "0.9", transform: "scale(1.05)" },
        },
        borderGlow: {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(14,165,233,0.4)" },
          "50%":     { boxShadow: "0 0 0 6px rgba(14,165,233,0)" },
        },
      },
      backgroundImage: {
        "hero-gradient":    "linear-gradient(135deg, #0F172A 0%, #0c4a6e 50%, #075985 100%)",
        "ocean-gradient":   "linear-gradient(135deg, #0ea5e9, #0284c7)",
        "nature-gradient":  "linear-gradient(135deg, #22c55e, #16a34a)",
        "sunset-gradient":  "linear-gradient(135deg, #f97316, #ea580c)",
        "card-gradient":    "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,249,255,0.6))",
      },
    },
  },
  plugins: [],
};
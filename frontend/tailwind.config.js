/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // glazer palette
        aura: {
          gold: "#F5C518",
          pink: "#FF3E8A",
          white: "#FFFBE6",
        },
        // chud palette
        brick: {
          swamp: "#5B5E2C",
          piss: "#C8B40E",
          static: "#7A7A7A",
        },
        ink: "#0a0a0a",
      },
      fontFamily: {
        display: ["'Anton'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        cringe: ["'Comic Sans MS'", "cursive"],
      },
      keyframes: {
        pulseAura: {
          "0%, 100%": { boxShadow: "0 0 30px 8px #F5C518" },
          "50%":      { boxShadow: "0 0 60px 16px #FF3E8A" },
        },
        floatUp: {
          "0%":   { transform: "translateY(0) scale(1)",   opacity: 1 },
          "100%": { transform: "translateY(-120px) scale(1.5)", opacity: 0 },
        },
        brickFall: {
          "0%":   { transform: "translateY(-300px) rotate(0)",   opacity: 1 },
          "100%": { transform: "translateY(0) rotate(45deg)", opacity: 1 },
        },
        glitch: {
          "0%, 100%": { transform: "translate(0)" },
          "20%":      { transform: "translate(-2px, 2px)" },
          "40%":      { transform: "translate(-2px, -2px)" },
          "60%":      { transform: "translate(2px, 2px)" },
          "80%":      { transform: "translate(2px, -2px)" },
        },
      },
      animation: {
        "pulse-aura": "pulseAura 1.2s ease-in-out infinite",
        "float-up":   "floatUp 1.2s ease-out forwards",
        "brick-fall": "brickFall 0.5s ease-in forwards",
        glitch:       "glitch 0.3s steps(2) infinite",
      },
    },
  },
  plugins: [],
};

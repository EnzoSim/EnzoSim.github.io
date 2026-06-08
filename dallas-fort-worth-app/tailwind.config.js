/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        guide: {
          ink: "#111116",
          red: "#b5122b",
          redDeep: "#8d0d20",
          gold: "#b58b47",
          mist: "#eef5f8",
          glass: "rgba(255,255,255,0.68)",
          smoke: "#f8fafb"
        }
      },
      boxShadow: {
        glass: "0 24px 80px rgba(16, 24, 40, 0.16)",
        soft: "0 12px 40px rgba(17, 17, 22, 0.10)"
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "SF Pro Display", "Segoe UI", "sans-serif"],
        serif: ["Fraunces", "Georgia", "serif"]
      },
      backdropBlur: {
        xl: "24px"
      }
    }
  },
  plugins: []
};

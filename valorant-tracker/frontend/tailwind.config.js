/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Official Valorant Colors
        'val-red': '#FF4655',
        'val-dark': '#0F1923',
        'val-blue': '#1F2B35', 
        // Glassy Colors (White with opacity)
        'glass-light': 'rgba(255, 255, 255, 0.05)',
        'glass-hover': 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        // Optional: If you want a gaming font later
        sans: ['Inter', 'sans-serif'], 
      },
      backgroundImage: {
        // A subtle gradient for the whole page
        'hero-pattern': "linear-gradient(to bottom right, #0F1923, #182635)",
      }
    },
  },
  plugins: [],
}
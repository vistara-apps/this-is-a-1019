/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(210, 36%, 96%)',
        accent: 'hsl(134, 61%, 41%)',
        primary: 'hsl(208, 98%, 51%)',
        surface: 'hsl(0, 0%, 100%)',
        'text-primary': 'hsl(222, 47%, 11%)',
        'text-secondary': 'hsl(222, 47%, 31%)',
      },
      borderRadius: {
        'lg': '12px',
        'md': '8px',
        'sm': '4px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(0, 0%, 0%, 0.05)',
        'modal': '0 16px 48px hsla(0, 0%, 0%, 0.16)',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
      },
    },
  },
  plugins: [],
}
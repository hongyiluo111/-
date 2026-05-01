/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1976d2',
        secondary: '#42a5f5',
        accent: '#0d47a1',
        background: '#f8f9fa',
        surface: '#ffffff',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196f3',
        success: '#4caf50',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary:   '#0B1F3F',
        secondary: '#1E88E5',
        accent:    '#FF6F00',
        success:   '#2E7D32',
        warning:   '#F9A825',
        danger:    '#C62828',
      },
    },
  },
  plugins: [],
};

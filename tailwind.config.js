/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary:   { DEFAULT: '#723B8F', light: '#8B5BA8' },
        secondary: { DEFAULT: '#DA2E8F', light: '#E85AAB' },
        accent:    '#F472B6',
        success:   '#34D399',
        warning:   '#FBBF24',
        danger:    '#F87171',
        glass: {
          50:  'rgba(255, 255, 255, 0.04)',
          100: 'rgba(255, 255, 255, 0.06)',
          200: 'rgba(255, 255, 255, 0.08)',
          300: 'rgba(255, 255, 255, 0.12)',
          400: 'rgba(255, 255, 255, 0.16)',
          500: 'rgba(255, 255, 255, 0.20)',
        },
      },
      borderRadius: {
        'squircle': '20px',
        'squircle-sm': '14px',
        'squircle-lg': '28px',
      },
      backdropBlur: {
        glass: '20px',
        heavy: '40px',
      },
      boxShadow: {
        glass: '0 4px 24px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        glow: '0 0 40px rgba(218, 46, 143, 0.15)',
        'glow-strong': '0 0 60px rgba(218, 46, 143, 0.25)',
      },
    },
  },
  plugins: [],
};

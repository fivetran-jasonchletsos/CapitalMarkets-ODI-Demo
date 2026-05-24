/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a1628',
        navy: {
          50: '#f1f4f9',
          100: '#dae3ef',
          200: '#b3c4dc',
          300: '#7d97bd',
          400: '#4b6892',
          500: '#2d4a76',
          600: '#1e3a5f',
          700: '#152c4a',
          800: '#0e1f36',
          900: '#0a1628',
        },
        gold: {
          DEFAULT: '#d4af37',
          dim: '#a88a2c',
          bright: '#f0c948',
        },
        live: '#10e88a',
        warn: '#f59e0b',
        alert: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'Menlo', 'monospace'],
      },
      borderRadius: {
        none: '0',
      },
    },
  },
  plugins: [],
};

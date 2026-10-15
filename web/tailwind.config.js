/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        fastwork: {
          50: '#F0F6FF',
          100: '#E0EDFF',
          200: '#BAD6FF',
          300: '#7DB5FF',
          400: '#388EFF',
          500: '#0066FF', // Fastwork Signature Blue
          600: '#0052CC',
          700: '#003E99',
          800: '#002B66',
          900: '#001833',
        },
        surface: {
          ground: '#F7F9FB',
          card: '#FFFFFF',
          border: '#E8ECF2',
        },
      },
      fontFamily: {
        sans: [
          'Noto Sans Thai',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        'fastwork-sm': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'fastwork': '0 4px 16px rgba(0, 102, 255, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)',
        'fastwork-hover': '0 8px 24px rgba(0, 102, 255, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
        'fastwork-elevated': '0 12px 36px rgba(0, 102, 255, 0.16)',
      },
    },
  },
  plugins: [],
};

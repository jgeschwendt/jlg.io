/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/app/**/*.tsx', './src/components/**/*.tsx'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-geist-mono)'],
      },
      keyframes: () => ({
        fadeToTransparent: {
          '0%': {
            opacity: 1,
          },
          '40%': {
            opacity: 1,
          },
          '100%': {
            opacity: 0,
          },
        },
        highlight: {
          '0%': {
            background: 'pink',
            color: 'white',
          },
          '40%': {
            background: 'pink',
            color: 'white',
          },
        },
        rerender: {
          '0%': {
            'border-color': 'pink',
          },
          '40%': {
            'border-color': 'pink',
          },
        },
        shimmer: {
          '100%': {
            transform: 'translateX(100%)',
          },
        },
        translateXReset: {
          '100%': {
            transform: 'translateX(0)',
          },
        },
      }),
    },
  },
};

export default config;

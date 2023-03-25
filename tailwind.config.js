/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-lato)'],
      },
      keyframes: () => ({
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
            ['border-color']: 'pink',
          },
          '40%': {
            ['border-color']: 'pink',
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
      }),
    },
  },
};

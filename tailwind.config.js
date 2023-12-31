/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';
import colors from 'tailwindcss/colors';

export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/deez-components/**/*.js',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        white: colors.gray['50'],
        black: colors.gray['900'],
        primary: colors.sky,
        danger: colors.red,
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at bottom, #082f49 0%, #111827 50%)',
      },
    },
  },
  plugins: [forms],
};

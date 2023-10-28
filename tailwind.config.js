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
        primary: colors.sky,
        danger: colors.red,
      },
    },
  },
  plugins: [forms],
};

import { getIconCollections, iconsPlugin } from '@egoist/tailwindcss-icons';
import forms from '@tailwindcss/forms';
import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/deez-components/dist/deez-components.js',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        black: colors.gray['900'],
        primary: colors.sky,
        danger: colors.red,
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at bottom, #082f49 0%, #111827 50%)',
      },
    },
  },
  plugins: [
    forms,
    iconsPlugin({
      // Select the icon collections you want to use
      collections: getIconCollections(['lucide', 'majesticons']),
    }),
  ],
};

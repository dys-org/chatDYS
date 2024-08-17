import { URL, fileURLToPath } from 'node:url';

import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import tailwind from 'tailwindcss';
import twNesting from 'tailwindcss/nesting';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    postcss: {
      plugins: [twNesting(), tailwind(), autoprefixer()],
    },
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    // enable devtools in prod https://github.com/vuejs/core/tree/main/packages/vue#bundler-build-feature-flags
    __VUE_PROD_DEVTOOLS__: true,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:6969',
      '/auth': 'http://localhost:6969',
    },
  },
});

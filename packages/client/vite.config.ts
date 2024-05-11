import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
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

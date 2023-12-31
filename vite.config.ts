import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import Icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), Icons({ scale: 0 })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    // enable devtools in prod https://github.com/vuejs/core/tree/main/packages/vue#bundler-build-feature-flags
    __VUE_PROD_DEVTOOLS__: true,
  },
});

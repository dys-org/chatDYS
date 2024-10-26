import type { VueQueryPluginOptions } from '@tanstack/vue-query';
import { QueryCache, VueQueryPlugin } from '@tanstack/vue-query';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from './App.vue';
import './assets/main.css';
import { toastErrorHandler } from './lib';
import router from './router';
import resetStore from './stores/plugins/resetStore';

const app = createApp(App);

const pinia = createPinia();
pinia.use(resetStore);
app.use(pinia);

const vueQueryPluginOptions: VueQueryPluginOptions = {
  queryClientConfig: {
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.meta?.errorMessage) {
          toastErrorHandler(error, query.meta.errorMessage as string);
        }
      },
    }),
  },
};
app.use(VueQueryPlugin, vueQueryPluginOptions);

app.use(router);

app.mount('#app');

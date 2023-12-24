import { createApp } from 'vue';
import { createAuth0 } from '@auth0/auth0-vue';
import { createPinia } from 'pinia';

import resetStore from './stores/plugins/resetStore';
import App from './App.vue';
import router from './router';

import './assets/main.css';

const app = createApp(App);

const pinia = createPinia();
pinia.use(resetStore);
app.use(pinia);
app.use(router);

app.use(
  createAuth0({
    domain: 'dev-lnt7gfcfv1ftlm5y.us.auth0.com',
    clientId: 'vRkFcEgUwMGYgnm2qN4JAqIwcBc5h3xd',
    authorizationParams: {
      redirect_uri: window.location.origin,
    },
  }),
);

app.mount('#app');

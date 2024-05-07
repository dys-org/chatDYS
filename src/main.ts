// import { createAuth0 } from '@auth0/auth0-vue';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from './App.vue';
import './assets/main.css';
import router from './router';
import resetStore from './stores/plugins/resetStore';

// export const auth0 = createAuth0({
//   domain: import.meta.env.VITE_AUTH0_DOMAIN,
//   clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
//   authorizationParams: {
//     redirect_uri: import.meta.env.VITE_AUTH0_CALLBACK_URL,
//     audience: import.meta.env.VITE_AUTH0_API_AUDIENCE,
//   },
// });

const app = createApp(App);

const pinia = createPinia();
pinia.use(resetStore);
app.use(pinia);
app.use(router);

// app.use(auth0);

app.mount('#app');

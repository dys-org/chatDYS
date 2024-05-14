import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from './App.vue';
import './assets/main.css';
import router from './router';
import resetStore from './stores/plugins/resetStore';

const app = createApp(App);

const pinia = createPinia();
pinia.use(resetStore);
app.use(pinia);
app.use(router);

// app.use(auth0);

app.mount('#app');

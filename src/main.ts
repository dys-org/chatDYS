import { createApp } from 'vue';
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

app.mount('#app');

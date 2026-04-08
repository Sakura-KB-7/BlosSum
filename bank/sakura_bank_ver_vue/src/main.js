import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/auth';
import './assets/globals.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
useAuthStore(pinia).hydrate();
app.use(router);
app.mount('#app');

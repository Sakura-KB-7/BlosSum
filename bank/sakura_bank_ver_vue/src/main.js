import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/auth';
import './assets/globals.css';

const THEME_KEY = 'blosum_settings_theme';

function applyInitialTheme() {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  const savedTheme = window.localStorage.getItem(THEME_KEY);
  const mode =
    savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system'
      ? savedTheme
      : 'system';

  root.classList.remove('dark');
  if (
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    root.classList.add('dark');
  }
}

applyInitialTheme();

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
useAuthStore(pinia).hydrate();
app.use(router);
app.mount('#app');

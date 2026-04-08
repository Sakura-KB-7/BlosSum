import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

const STORAGE_KEY = 'spring-wallet-auth-user';

export const useAuthStore = defineStore('auth', () => {
  const currentUserId = ref('');

  function hydrate() {
    if (typeof window === 'undefined') return;
    currentUserId.value = window.localStorage.getItem(STORAGE_KEY) || '';
  }

  function login(userId) {
    currentUserId.value = String(userId || '');
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, currentUserId.value);
    }
  }

  function logout() {
    currentUserId.value = '';
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  const isAuthenticated = computed(() => currentUserId.value.length > 0);

  return {
    currentUserId,
    isAuthenticated,
    hydrate,
    login,
    logout,
  };
});

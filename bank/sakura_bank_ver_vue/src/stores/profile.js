import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { http } from '@/api/http';
import { useAuthStore } from '@/stores/auth';

export const useProfileStore = defineStore('profile', () => {
  const auth = useAuthStore();
  const rows = ref([]);
  const loading = ref(false);

  const profile = computed(() => rows.value[0] ?? null);

  async function fetchAll() {
    loading.value = true;
    try {
      if (!auth.currentUserId) {
        rows.value = [];
        return;
      }

      const { data } = await http.get('/userSettings', {
        params: { userId: auth.currentUserId },
      });
      rows.value = Array.isArray(data) ? data : [];
    } finally {
      loading.value = false;
    }
  }

  async function save(partial) {
    const current = profile.value;
    if (current) {
      const { data } = await http.put(`/userSettings/${current.id}`, {
        ...current,
        ...partial,
      });
      const i = rows.value.findIndex((x) => x.id === current.id);
      if (i >= 0) rows.value[i] = data;
      return data;
    }
    const { data } = await http.post('/userSettings', {
      userId: auth.currentUserId,
      name: partial.name ?? auth.currentUserId,
      email: partial.email ?? '',
      monthlyBudget: partial.monthlyBudget ?? 3_000_000,
      currency: partial.currency ?? 'KRW',
    });
    rows.value = [data];
    return data;
  }

  return { rows, profile, loading, fetchAll, save };
});

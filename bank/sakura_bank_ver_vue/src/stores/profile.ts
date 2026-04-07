import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { http } from '@/api/http';
import type { UserSettingsRow } from '@/types/models';

export const useProfileStore = defineStore('profile', () => {
  const rows = ref<UserSettingsRow[]>([]);
  const loading = ref(false);

  const profile = computed(() => rows.value[0] ?? null);

  async function fetchAll() {
    loading.value = true;
    try {
      const { data } = await http.get<UserSettingsRow[]>('/userSettings');
      rows.value = Array.isArray(data) ? data : [];
    } finally {
      loading.value = false;
    }
  }

  async function save(
    partial: Pick<UserSettingsRow, 'name' | 'email' | 'monthlyBudget' | 'currency'>
  ) {
    const current = profile.value;
    if (current) {
      const { data } = await http.put<UserSettingsRow>(`/userSettings/${current.id}`, {
        ...current,
        ...partial,
      });
      const i = rows.value.findIndex((x) => x.id === current.id);
      if (i >= 0) rows.value[i] = data;
      return data;
    }
    const { data } = await http.post<UserSettingsRow>('/userSettings', {
      id: 1,
      name: partial.name ?? 'admin',
      email: partial.email ?? '',
      monthlyBudget: partial.monthlyBudget ?? 3_000_000,
      currency: partial.currency ?? 'KRW',
    });
    rows.value = [data];
    return data;
  }

  return { rows, profile, loading, fetchAll, save };
});

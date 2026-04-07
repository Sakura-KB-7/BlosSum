import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { http } from '@/api/http';
import type { ProfileRow } from '@/types/models';

export const useProfileStore = defineStore('profile', () => {
  const rows = ref<ProfileRow[]>([]);
  const loading = ref(false);

  const profile = computed(() => rows.value[0] ?? null);

  async function fetchAll() {
    loading.value = true;
    try {
      const { data } = await http.get<ProfileRow[]>('/profiles');
      rows.value = Array.isArray(data) ? data : [];
    } finally {
      loading.value = false;
    }
  }

  async function save(partial: Pick<ProfileRow, 'name' | 'email'>) {
    const current = profile.value;
    if (current) {
      const { data } = await http.put<ProfileRow>(`/profiles/${current.id}`, {
        ...current,
        ...partial,
      });
      const i = rows.value.findIndex((x) => x.id === current.id);
      if (i >= 0) rows.value[i] = data;
      return data;
    }
    const { data } = await http.post<ProfileRow>('/profiles', {
      id: '1',
      name: partial.name,
      email: partial.email,
    });
    rows.value = [data];
    return data;
  }

  return { rows, profile, loading, fetchAll, save };
});

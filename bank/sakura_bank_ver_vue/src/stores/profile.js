import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { http } from '@/api/http';
import { useAuthStore } from '@/stores/auth';

function idPart(id) {
  return String(id);
}

export const useProfileStore = defineStore('profile', () => {
  const auth = useAuthStore();
  const rows = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const profile = computed(() => rows.value[0] ?? null);

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      if (!auth.currentUserId) {
        rows.value = [];
        return;
      }

      // userId 타입 불일치(숫자/문자열)로 조회 누락되는 경우를 방지
      const { data } = await http.get('/userSettings');
      const list = Array.isArray(data) ? data : [];
      rows.value = list.filter(
        (row) => idPart(row.userId).trim() === idPart(auth.currentUserId).trim()
      );
    } catch (e) {
      error.value = '설정 정보를 불러오지 못했습니다.';
      rows.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function save(partial) {
    error.value = null;
    if (!auth.currentUserId) {
      throw new Error('로그인 정보가 없습니다.');
    }
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

  return { rows, profile, loading, error, fetchAll, save };
});

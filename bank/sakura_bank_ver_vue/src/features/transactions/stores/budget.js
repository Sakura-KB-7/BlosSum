import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { http } from '@/api/http';
import { useAuthStore } from '@/stores/auth';

function idPart(id) {
  if (id === null || id === undefined) return '';
  return String(id).trim();
}

function sameMonth(dateIso, y, m) {
  const d = new Date(dateIso);
  return d.getFullYear() === y && d.getMonth() + 1 === m;
}

export const useBudgetStore = defineStore('budget', () => {
  const auth = useAuthStore();
  const items = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchAll() {
    console.log('현재 로그인된 ID:', auth.currentUserId);
    loading.value = true;
    error.value = null;
    try {
      const currentUid = idPart(auth.currentUserId);

      if (!currentUid) {
        console.warn('사용자 ID가 없어 내역을 불러올 수 없습니다.');
        items.value = [];
        return;
      }

      const { data } = await http.get('/records');
      const list = Array.isArray(data) ? data : [];

      // userId 타입 불일치 방지를 위해 idPart로 변환 후 비교
      // items.value = list.filter((row) => idPart(row.userId) === currentUid);
      items.value = list;

      console.log(`불러오기 완료: ${items.value.length}개의 내역`);
    } catch (e) {
      error.value = '거래 내역을 불러오지 못했습니다. 서버 상태를 확인하세요.';
      items.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function createRow(body) {
    if (!auth.currentUserId) {
      throw new Error('로그인 정보가 없습니다.');
    }
    const { data } = await http.post('/records', {
      ...body,
      userId: auth.currentUserId,
    });
    items.value.unshift(data);
    return data;
  }

  async function updateRow(id, payload) {
    const targetId = idPart(id);
    const existing = items.value.find((x) => idPart(x.id) === targetId);
    if (!existing) {
      throw new Error('수정할 거래를 찾을 수 없습니다.');
    }
    const { data } = await http.put(`/records/${targetId}`, {
      ...payload,
      id: Number(id) || id,
      userId: auth.currentUserId, // 수정 시에도 userId 유지
    });

    const i = items.value.findIndex((x) => idPart(x.id) === targetId);
    if (i >= 0) items.value[i] = data;
    return data;
  }

  async function removeRow(id) {
    const targetId = idPart(id);
    const exists = items.value.some((x) => idPart(x.id) === targetId);
    if (!exists) {
      throw new Error('삭제할 거래를 찾을 수 없습니다.');
    }
    await http.delete(`/records/${targetId}`);
    items.value = items.value.filter((x) => idPart(x.id) !== targetId);
  }

    try {
      // 3. 서버 삭제 요청
      await http.delete(`/records/${targetId}`);
      console.log(`ID ${targetId} 삭제 요청 보냄`);
    } catch (e) {
      console.error('서버 삭제 중 오류 발생 (무시하고 로컬 유지):', e);
    }
  }
  // 필터링된 데이터 반환
  function filtered(params) {
    return items.value.filter((row) => {
      if (params.type && row.type !== params.type) return false;
      if (
        params.categoryId !== undefined &&
        params.categoryId !== '' &&
        idPart(row.categoryId) !== idPart(params.categoryId)
      )
        return false;
      if (params.from && row.date < params.from) return false;
      if (params.to && row.date > params.to) return false;
      return true;
    });
  }

  const recent = computed(() =>
    [...items.value].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 8),
  );

  function monthlyTotals(year, month) {
    const rows = items.value.filter((r) => sameMonth(r.date, year, month));
    let income = 0;
    let expense = 0;
    for (const r of rows) {
      const amount = Number(r.amount || 0);
      if (r.type === 'income') income += amount;
      else expense += amount;
    }
    return { income, expense, net: income - expense, count: rows.length };
  }

  return {
    items,
    loading,
    error,
    fetchAll,
    createRow,
    updateRow,
    removeRow,
    filtered,
    recent,
    monthlyTotals,
  };
});

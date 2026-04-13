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

function sameUserId(recordUserId, currentUserId) {
  return idPart(recordUserId).trim() === idPart(currentUserId).trim();
}
export const useBudgetStore = defineStore('budget', () => {
  const auth = useAuthStore();
  const items = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const currentUid = idPart(auth.currentUserId);
      if (!currentUid) {
        items.value = [];
        return;
      }

      // 1차: 서버 쿼리 필터
      const { data } = await http.get('/records', {
        params: { userId: currentUid },
      });
      const queried = Array.isArray(data) ? data : [];

      // 2차: 타입 불일치 방지를 위한 클라이언트 정규화 필터
      if (queried.length > 0) {
        items.value = queried.filter((row) => sameUserId(row.userId, currentUid));
        return;
      }

      // 일부 데이터가 숫자/문자열 혼합일 때 대비
      const { data: allData } = await http.get('/records');
      const all = Array.isArray(allData) ? allData : [];
      items.value = all.filter((row) => sameUserId(row.userId, currentUid));
    } catch (e) {
      error.value = '거래 내역을 불러오지 못했습니다. json-server가 켜져 있는지 확인하세요.';
      items.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function createRow(body) {
    const currentUid = idPart(auth.currentUserId);
    if (!currentUid) {
      throw new Error('로그인 정보가 없습니다.');
    }
    const { data } = await http.post('/records', {
      ...body,
      userId: currentUid,
    });
    items.value.unshift(data);
    return data;
  }

  async function updateRow(id, payload) {
    const targetId = idPart(id);
    const currentUid = idPart(auth.currentUserId);
    if (!currentUid) throw new Error('로그인 정보가 없습니다.');
    const existing = items.value.find((x) => idPart(x.id) === targetId);
    if (!existing) {
      throw new Error('수정할 거래를 찾을 수 없습니다.');
    }
    if (!sameUserId(existing.userId, currentUid)) {
      throw new Error('다른 사용자 거래는 수정할 수 없습니다.');
    }
    const { data } = await http.put(`/records/${targetId}`, {
      ...payload,
      id: Number(id) || id,
      userId: currentUid,
    });

    const i = items.value.findIndex((x) => idPart(x.id) === targetId);
    if (i >= 0) items.value[i] = data;
    return data;
  }

  async function removeRow(id) {
    const targetId = idPart(id);
    const currentUid = idPart(auth.currentUserId);
    if (!currentUid) throw new Error('로그인 정보가 없습니다.');
    if (!targetId || !/^\d+$/.test(targetId)) {
      throw new Error('삭제할 거래 ID 형식이 올바르지 않습니다.');
    }

    const target = items.value.find((x) => idPart(x.id) === targetId);
    if (!target) {
      throw new Error('삭제할 거래를 찾을 수 없습니다.');
    }
    if (!sameUserId(target.userId, currentUid)) {
      throw new Error('다른 사용자 거래는 삭제할 수 없습니다.');
    }

    const previousItems = [...items.value];
    items.value = items.value.filter((x) => idPart(x.id) !== targetId);
    try {
      await http.delete(`/records/${targetId}`);
    } catch (e) {
      items.value = previousItems;
      throw e;
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
    [...items.value].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 8)
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

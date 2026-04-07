import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { http } from '@/api/http';

function sameMonth(dateIso, y, m) {
  const d = new Date(dateIso);
  return d.getFullYear() === y && d.getMonth() + 1 === m;
}

function idPart(id) {
  return String(id);
}

export const useBudgetStore = defineStore('budget', () => {
  const items = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await http.get('/records');
      items.value = Array.isArray(data) ? data : [];
    } catch (e) {
      error.value = '거래 내역을 불러오지 못했습니다. json-server가 켜져 있는지 확인하세요.';
      items.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function createRow(body) {
    const { data } = await http.post('/records', body);
    items.value.unshift(data);
    return data;
  }

  async function updateRow(id, payload) {
    const { data } = await http.put(`/records/${idPart(id)}`, {
      ...payload,
      id: Number(id) || id,
    });
    const i = items.value.findIndex((x) => idPart(x.id) === id);
    if (i >= 0) items.value[i] = data;
    return data;
  }

  async function removeRow(id) {
    await http.delete(`/records/${idPart(id)}`);
    items.value = items.value.filter((x) => idPart(x.id) !== id);
  }

  function filtered(params) {
    return items.value.filter((row) => {
      if (params.type && row.type !== params.type) return false;
      if (
        params.categoryId !== undefined &&
        params.categoryId !== '' &&
        row.categoryId !== params.categoryId
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
      if (r.type === 'income') income += r.amount;
      else expense += r.amount;
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

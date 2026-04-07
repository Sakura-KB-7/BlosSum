import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { http } from '@/api/http';
import type { BudgetRow, BudgetType } from '@/types/models';

function sameMonth(dateIso: string, y: number, m: number) {
  const d = new Date(dateIso);
  return d.getFullYear() === y && d.getMonth() + 1 === m;
}

export const useBudgetStore = defineStore('budget', () => {
  const items = ref<BudgetRow[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await http.get<BudgetRow[]>('/budget');
      items.value = Array.isArray(data) ? data : [];
    } catch (e) {
      error.value = '거래 내역을 불러오지 못했습니다. json-server가 켜져 있는지 확인하세요.';
      items.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function createRow(row: BudgetRow) {
    const { data } = await http.post<BudgetRow>('/budget', row);
    items.value.unshift(data);
    return data;
  }

  async function updateRow(id: string, payload: Omit<BudgetRow, 'id'>) {
    const { data } = await http.put<BudgetRow>(`/budget/${id}`, { ...payload, id });
    const i = items.value.findIndex((x) => x.id === id);
    if (i >= 0) items.value[i] = data;
    return data;
  }

  async function removeRow(id: string) {
    await http.delete(`/budget/${id}`);
    items.value = items.value.filter((x) => x.id !== id);
  }

  function filtered(params: {
    type?: BudgetType | '';
    category?: string;
    from?: string;
    to?: string;
  }) {
    return items.value.filter((row) => {
      if (params.type && row.type !== params.type) return false;
      if (params.category && row.category !== params.category) return false;
      if (params.from && row.date < params.from) return false;
      if (params.to && row.date > params.to) return false;
      return true;
    });
  }

  const recent = computed(() =>
    [...items.value].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 8)
  );

  function monthlyTotals(year: number, month: number) {
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

import { ref } from 'vue';
import { defineStore } from 'pinia';
import { http } from '@/api/http';
import type { CategoryItem } from '@/types/models';

export const useCategoryStore = defineStore('categories', () => {
  const income = ref<CategoryItem[]>([]);
  const expense = ref<CategoryItem[]>([]);
  const loading = ref(false);

  async function fetchAll() {
    loading.value = true;
    try {
      const { data } = await http.get<CategoryItem[]>('/categories');
      const list = Array.isArray(data) ? data : [];
      income.value = list.filter((c) => c.type === 'income');
      expense.value = list.filter((c) => c.type === 'expense');
    } finally {
      loading.value = false;
    }
  }

  return { income, expense, loading, fetchAll };
});

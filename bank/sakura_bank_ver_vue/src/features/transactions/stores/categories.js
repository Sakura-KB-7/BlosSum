import { ref } from 'vue';
import { defineStore } from 'pinia';
import { http } from '@/api/http';

export const useCategoryStore = defineStore('categories', () => {
  const income = ref([]);
  const expense = ref([]);
  const loading = ref(false);

  async function fetchAll() {
    loading.value = true;
    try {
      const { data } = await http.get('/categories');
      const list = Array.isArray(data) ? data : [];
      income.value = list.filter((c) => c.type === 'income');
      expense.value = list.filter((c) => c.type === 'expense');
    } finally {
      loading.value = false;
    }
  }

  return { income, expense, loading, fetchAll };
});

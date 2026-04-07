import { ref } from 'vue';
import { defineStore } from 'pinia';
import { http } from '@/api/http';
import type { CategoryItem } from '@/types/models';

/**
 * 가이드 PDF는 문자열 배열 예시이나, json-server CRUD를 위해 { id, name } 배열을 사용합니다.
 * 데이터만 "뽑아오실" 때는 각 항목을 한 줄씩 객체로 넣으면 됩니다.
 */
export const useCategoryStore = defineStore('categories', () => {
  const income = ref<CategoryItem[]>([]);
  const expense = ref<CategoryItem[]>([]);
  const loading = ref(false);

  async function fetchAll() {
    loading.value = true;
    try {
      const [inc, exp] = await Promise.all([
        http.get<CategoryItem[]>('/incomeCategory'),
        http.get<CategoryItem[]>('/expenseCategory'),
      ]);
      income.value = Array.isArray(inc.data) ? inc.data : [];
      expense.value = Array.isArray(exp.data) ? exp.data : [];
    } finally {
      loading.value = false;
    }
  }

  return { income, expense, loading, fetchAll };
});

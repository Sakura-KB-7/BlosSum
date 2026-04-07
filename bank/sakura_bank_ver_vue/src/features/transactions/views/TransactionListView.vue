<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import UiCard from '@/shared/ui/UiCard.vue';
import UiButton from '@/shared/ui/UiButton.vue';
import { useBudgetStore } from '@/features/transactions/stores/budget';
import { useCategoryStore } from '@/features/transactions/stores/categories';

const budget = useBudgetStore();
const categories = useCategoryStore();
const router = useRouter();

const typeFilter = ref('');
const categoryFilter = ref('');
const from = ref('');
const to = ref('');

onMounted(async () => {
  await Promise.all([budget.fetchAll(), categories.fetchAll()]);
});

function categoryName(categoryId) {
  const all = [...categories.income, ...categories.expense];
  return all.find((c) => c.id === categoryId)?.name ?? `id:${categoryId}`;
}

const rows = computed(() =>
  budget.filtered({
    type: typeFilter.value,
    categoryId:
      categoryFilter.value === '' || categoryFilter.value === undefined
        ? undefined
        : Number(categoryFilter.value),
    from: from.value || undefined,
    to: to.value || undefined,
  })
);

const categoryOptions = computed(() => {
  if (typeFilter.value === 'income') return categories.income;
  if (typeFilter.value === 'expense') return categories.expense;
  return [...categories.income, ...categories.expense];
});

function won(n) {
  return new Intl.NumberFormat('ko-KR').format(n) + '원';
}

async function onDelete(id) {
  if (!confirm('이 거래를 삭제할까요?')) return;
  await budget.removeRow(String(id));
}

function onEdit(id) {
  router.push({ name: 'transaction-edit', params: { id: String(id) } });
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-foreground">거래 내역</h1>
      <p class="text-muted-foreground">json-server에 저장된 수입·지출을 필터하고 수정합니다.</p>
    </div>

    <p
      v-if="budget.error"
      class="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {{ budget.error }}
    </p>

    <UiCard class="border-none bg-card/80 shadow-sm backdrop-blur-sm">
      <div class="flex flex-wrap items-end gap-4 p-4">
        <div class="flex min-w-[140px] flex-col gap-1">
          <label class="text-xs text-muted-foreground">구분</label>
          <select
            v-model="typeFilter"
            class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">전체</option>
            <option value="income">수입</option>
            <option value="expense">지출</option>
          </select>
        </div>
        <div class="flex min-w-[160px] flex-col gap-1">
          <label class="text-xs text-muted-foreground">카테고리</label>
          <select
            v-model="categoryFilter"
            class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">전체</option>
            <option v-for="c in categoryOptions" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="flex min-w-[140px] flex-col gap-1">
          <label class="text-xs text-muted-foreground">시작일</label>
          <input
            v-model="from"
            type="date"
            class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div class="flex min-w-[140px] flex-col gap-1">
          <label class="text-xs text-muted-foreground">종료일</label>
          <input
            v-model="to"
            type="date"
            class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <RouterLink to="/transactions/new" class="ml-auto">
          <UiButton class="rounded-full bg-primary text-primary-foreground">새 거래</UiButton>
        </RouterLink>
      </div>
    </UiCard>

    <p v-if="budget.loading" class="text-sm text-muted-foreground">불러오는 중…</p>

    <UiCard v-else class="border-none bg-card/80 shadow-sm backdrop-blur-sm">
      <div class="overflow-auto p-2">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-border text-left text-muted-foreground">
              <th class="px-3 py-2 font-medium">날짜</th>
              <th class="px-3 py-2 font-medium">구분</th>
              <th class="px-3 py-2 font-medium">카테고리</th>
              <th class="px-3 py-2 font-medium">제목</th>
              <th class="px-3 py-2 font-medium">금액</th>
              <th class="px-3 py-2 font-medium">메모</th>
              <th class="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.id" class="border-b border-border/60">
              <td class="px-3 py-2">{{ r.date }}</td>
              <td class="px-3 py-2">{{ r.type === 'income' ? '수입' : '지출' }}</td>
              <td class="px-3 py-2">{{ categoryName(r.categoryId) }}</td>
              <td class="max-w-[180px] truncate px-3 py-2">{{ r.title }}</td>
              <td class="px-3 py-2 font-medium">{{ won(r.amount) }}</td>
              <td class="max-w-[160px] truncate px-3 py-2 text-muted-foreground">{{ r.memo }}</td>
              <td class="whitespace-nowrap px-3 py-2 text-right">
                <UiButton variant="ghost" size="sm" class="text-primary" @click="onEdit(r.id)"
                  >수정</UiButton
                >
                <UiButton
                  variant="ghost"
                  size="sm"
                  class="text-destructive"
                  @click="onDelete(r.id)"
                >
                  삭제
                </UiButton>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="!rows.length" class="p-6 text-center text-sm text-muted-foreground">
          조건에 맞는 거래가 없습니다.
        </p>
      </div>
    </UiCard>
  </div>
</template>

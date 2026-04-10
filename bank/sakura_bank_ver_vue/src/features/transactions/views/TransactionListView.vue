<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import UiCard from '@/shared/ui/UiCard.vue';
import UiButton from '@/shared/ui/UiButton.vue';
import { useBudgetStore } from '@/features/transactions/stores/budget';
import { useCategoryStore } from '@/features/transactions/stores/categories';
import { cn } from '@/shared/lib/utils';

const budget = useBudgetStore();
const categories = useCategoryStore();
const router = useRouter();

const typeFilter = ref('');
const categoryFilter = ref('');
const from = ref('');
const to = ref('');

// 페이지네이션
const currentPage = ref(1);
const itemsPerPage = 8;

onMounted(async () => {
  await Promise.all([budget.fetchAll(), categories.fetchAll()]);
});

const rows = computed(() => {
  const data = budget.filtered({
    type: typeFilter.value,
    categoryId:
      categoryFilter.value === '' || categoryFilter.value === undefined
        ? undefined
        : Number(categoryFilter.value),
    from: from.value || undefined,
    to: to.value || undefined,
  });
  return data || [];
});

// 현재 페이지에 보여줄 데이터
const paginatedRows = computed(() => {
  if (rows.value.length === 0) return [];

  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  // 데이터가 존재할 때만 slice 실행
  return rows.value.slice(start, end);
});

// 전체 페이지 수 계산
const totalPages = computed(() =>
  rows.value.length > 0 ? Math.ceil(rows.value.length / itemsPerPage) : 0,
);

// 레이아웃 유지를 위한 빈 행 계산
const emptyRowsCount = computed(() => {
  if (totalPages.value === 0 || currentPage.value < totalPages.value) return 0;
  return itemsPerPage - paginatedRows.value.length;
});

// 필터가 변경되면 1페이지로 리셋
watch([typeFilter, categoryFilter, from, to], () => {
  currentPage.value = 1;
});

// 페이지 이동 함수
function goToPage(page) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
}

function categoryName(categoryId) {
  const all = [...categories.income, ...categories.expense];
  return all.find((c) => c.id === categoryId)?.name ?? `id:${categoryId}`;
}
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
const categoryOptions = computed(() => {
  if (typeFilter.value === 'income') return categories.income;
  if (typeFilter.value === 'expense') return categories.expense;
  return [...categories.income, ...categories.expense];
});
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-foreground">거래 내역 💸</h1>
      <p class="text-muted-foreground">
        소중한 기록들을 한눈에 확인하고 관리해 보세요
      </p>
    </div>

    <UiCard class="border-none bg-card/80 shadow-sm backdrop-blur-sm">
      <div class="flex flex-wrap items-end gap-3 p-4">
        <div class="flex flex-1 min-w-[120px] flex-col gap-1">
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
        <div class="flex flex-1 min-w-[140px] flex-col gap-1">
          <label class="text-xs text-muted-foreground">카테고리</label>
          <select
            v-model="categoryFilter"
            class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">전체</option>
            <option v-for="c in categoryOptions" :key="c.id" :value="c.id">
              {{ c.name }}
            </option>
          </select>
        </div>
        <div class="flex flex-1 min-w-[130px] flex-col gap-1">
          <label class="text-xs text-muted-foreground">시작일</label>
          <input
            v-model="from"
            type="date"
            class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div class="flex flex-1 min-w-[130px] flex-col gap-1">
          <label class="text-xs text-muted-foreground">종료일</label>
          <input
            v-model="to"
            type="date"
            class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <RouterLink to="/transactions/new" class="ml-auto w-full sm:w-auto">
          <UiButton
            class="rounded-full bg-primary text-primary-foreground w-full"
            >새 거래</UiButton
          >
        </RouterLink>
      </div>
    </UiCard>

    <div
      v-if="budget.loading"
      class="p-20 text-center text-sm text-muted-foreground"
    >
      데이터를 불러오는 중입니다...
    </div>

    <UiCard
      v-else
      class="border-none bg-card/80 shadow-sm backdrop-blur-sm overflow-hidden"
    >
      <div class="overflow-x-auto">
        <div class="inline-block min-w-[900px] w-full align-middle p-2">
          <table class="w-full border-collapse text-sm table-fixed">
            <thead>
              <tr
                class="border-b border-border text-left text-muted-foreground"
              >
                <th class="px-5 py-2 font-medium w-[140px]">날짜</th>
                <th class="px-5 py-2 font-medium w-[120px]">구분</th>
                <th class="px-5 py-2 font-medium w-[120px]">카테고리</th>
                <th class="px-5 py-2 font-medium w-[15%]">제목</th>
                <th class="px-5 py-2 font-medium w-[140px]">금액</th>
                <th class="px-5 py-2 font-medium w-[20%]">메모</th>
                <th class="px-5 py-2 font-medium w-[140px] text-right" />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="r in paginatedRows"
                :key="r.id"
                class="border-b border-border/60 h-[53px] hover:bg-muted/30 transition-colors"
              >
                <td class="px-5 py-2 text-muted-foreground tabular-nums">
                  {{ r.date }}
                </td>
                <td
                  :class="
                    cn(
                      'px-5 py-2 font-bold',
                      r.type === 'income' ? 'text-blue-500' : 'text-pink-500',
                    )
                  "
                >
                  {{ r.type === 'income' ? '수입' : '지출' }}
                </td>
                <td class="px-5 py-2 truncate text-slate-600">
                  {{ categoryName(r.categoryId) }}
                </td>
                <td class="px-5 py-2 truncate font-medium text-slate-800">
                  {{ r.title }}
                </td>
                <td
                  :class="
                    cn(
                      'px-5 py-2 font-bold whitespace-nowrap tabular-nums',
                      r.type === 'income' ? 'text-blue-500' : 'text-pink-500',
                    )
                  "
                >
                  {{ r.type === 'income' ? '+' : '-' }}{{ won(r.amount) }}
                </td>
                <td
                  class="px-5 py-2 truncate text-muted-foreground italic opacity-70"
                >
                  {{ r.memo || '-' }}
                </td>
                <td class="px-5 py-2 text-right">
                  <div
                    class="flex justify-end gap-1 whitespace-nowrap shrink-0"
                  >
                    <UiButton
                      variant="ghost"
                      size="sm"
                      class="h-8 px-2 text-primary"
                      @click="onEdit(r.id)"
                    >
                      수정
                    </UiButton>
                    <UiButton
                      variant="ghost"
                      size="sm"
                      class="h-8 px-2 text-destructive"
                      @click="onDelete(r.id)"
                    >
                      삭제
                    </UiButton>
                  </div>
                </td>
              </tr>

              <tr
                v-for="n in emptyRowsCount"
                :key="'empty-' + n"
                class="border-b border-border/10 h-[53px] box-border"
              >
                <td colspan="7" class="px-5 py-0">&nbsp;</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p
        v-if="rows.length === 0"
        class="p-20 text-center text-sm text-muted-foreground"
      >
        조건에 맞는 거래 내역이 없습니다.
      </p>

      <div
        v-if="totalPages > 0"
        class="flex items-center justify-center gap-2 p-4 border-t border-border/40"
      >
        <UiButton
          variant="ghost"
          size="sm"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          <ChevronLeft class="h-4 w-4" />
        </UiButton>
        <div class="flex items-center gap-1">
          <UiButton
            v-for="page in totalPages"
            :key="page"
            size="sm"
            :variant="currentPage === page ? 'default' : 'ghost'"
            class="h-8 w-8 rounded-full font-bold transition-all"
            @click="goToPage(page)"
          >
            {{ page }}
          </UiButton>
        </div>
        <UiButton
          variant="ghost"
          size="sm"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          <ChevronRight class="h-4 w-4" />
        </UiButton>
      </div>
    </UiCard>
  </div>
</template>

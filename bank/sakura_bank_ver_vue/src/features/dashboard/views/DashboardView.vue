<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  TrendingDown,
  TrendingUp,
  Target,
  ArrowDownRight,
  ArrowUpRight,
  ArrowRight,
  PieChart as PieChartIcon,
} from 'lucide-vue-next';

import UiCard from '@/shared/ui/UiCard.vue';
import StatCard from '../components/StatCard.vue';
import CategoryPie from '../components/CategoryPie.vue';
import NewsletterWidget from '../components/NewsletterWidget.vue';
import MapWidget from '../components/MapWidget.vue';
import ReceiptWidget from '../components/ReceiptWidget.vue';

import { useBudgetStore } from '@/features/transactions/stores/budget';
import { useCategoryStore } from '@/features/transactions/stores/categories';

const router = useRouter();
const budget = useBudgetStore();
const categories = useCategoryStore();

// 날짜 데이터
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth() + 1;

// 전월 데이터
const previousMonthDate = new Date(currentYear, today.getMonth() - 1, 1);
const previousYear = previousMonthDate.getFullYear();
const previousMonth = previousMonthDate.getMonth() + 1;

// 날짜 헤더
const dateLabel = computed(() =>
  new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(today),
);

const formatAmount = (val) =>
  new Intl.NumberFormat('ko-KR').format(Number(val || 0)) + '원';

// [1] 이번 달 내역 필터링
const currentMonthRows = computed(() =>
  budget.items.filter((row) => {
    const d = new Date(row.date);
    return d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth;
  }),
);

// [2] 지난 달 내역 필터링
const previousMonthRows = computed(() =>
  budget.items.filter((row) => {
    const d = new Date(row.date);
    return (
      d.getFullYear() === previousYear && d.getMonth() + 1 === previousMonth
    );
  }),
);

// ----- 계산 로직 -----

// 이번 달 수입/지출 합계
const currentIncomeTotal = computed(() =>
  currentMonthRows.value
    .filter((r) => r.type === 'income')
    .reduce((s, r) => s + Number(r.amount || 0), 0),
);

const currentExpenseTotal = computed(() =>
  currentMonthRows.value
    .filter((r) => r.type === 'expense')
    .reduce((s, r) => s + Number(r.amount || 0), 0),
);

// 지난 달 지출 합계
const previousExpenseTotal = computed(() =>
  previousMonthRows.value
    .filter((r) => r.type === 'expense')
    .reduce((s, r) => s + Number(r.amount || 0), 0),
);

// 증감률
const percentChange = computed(() => {
  const prev = previousExpenseTotal.value;
  if (prev <= 0) return '0.0';
  return (((currentExpenseTotal.value - prev) / prev) * 100).toFixed(1);
});

// 이번 달 소비율
const budgetUsageRate = computed(() => {
  const income = currentIncomeTotal.value;
  if (!income || income <= 0) return 0;
  return (currentExpenseTotal.value / income) * 100;
});

// 이번 달 여유 자금
const remainingBalance = computed(() => {
  return Math.max(currentIncomeTotal.value - currentExpenseTotal.value, 0);
});

// 차트 데이터
const categoryMap = computed(() =>
  [...categories.income, ...categories.expense].reduce(
    (acc, c) => ({ ...acc, [c.id]: c }),
    {},
  ),
);

const pieData = computed(() => {
  const totals = currentMonthRows.value
    .filter((r) => r.type === 'expense')
    .reduce((acc, r) => {
      acc[r.categoryId] = (acc[r.categoryId] || 0) + Number(r.amount || 0);
      return acc;
    }, {});

  return Object.entries(totals)
    .map(([id, val]) => ({
      name: categoryMap.value[id]?.name || `카테고리 ${id}`,
      value: val,
      color: categoryMap.value[id]?.color || '#e5e7eb',
    }))
    .sort((a, b) => b.value - a.value);
});

onMounted(async () => {
  await Promise.all([budget.fetchAll(), categories.fetchAll()]);
});
</script>

<template>
  <div class="space-y-6 max-w-full mx-auto pb-10">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground tracking-tight">
          환영합니다, 오늘도 좋은 하루예요 🌸
        </h1>
        <p class="text-muted-foreground text-sm">{{ dateLabel }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch mb-6">
      <StatCard
        title="이번 달 지출"
        :amount="formatAmount(currentExpenseTotal)"
        :icon="TrendingDown"
        icon-bg="bg-pink-100"
        icon-color="text-pink-600"
      >
        <template #footer>
          <div class="flex items-center gap-1 text-[11px] font-medium">
            <template v-if="Number(percentChange) < 0">
              <ArrowDownRight class="h-3.5 w-3.5 text-green-600" />
              <span class="text-green-600"
                >{{ Math.abs(percentChange) }}% 감소</span
              >
            </template>
            <template v-else>
              <ArrowUpRight class="h-3.5 w-3.5 text-pink-600" />
              <span class="text-pink-600">{{ percentChange }}% 증가</span>
            </template>
            <span class="text-muted-foreground opacity-70 ml-1">전월 대비</span>
          </div>
        </template>
      </StatCard>

      <StatCard
        title="이번 달 수입"
        :amount="formatAmount(currentIncomeTotal)"
        :icon="TrendingUp"
        icon-bg="bg-blue-100"
        icon-color="text-blue-600"
      >
        <template #footer>
          <p class="text-[10px] text-muted-foreground mt-1 italic">
            * 이번 달 기록된 모든 수입의 합계입니다.
          </p>
        </template>
      </StatCard>

      <StatCard
        title="이번 달 소비율"
        :amount="budgetUsageRate.toFixed(1) + '%'"
        :icon="Target"
        icon-bg="bg-amber-100"
        icon-color="text-amber-600"
        class="h-auto lg:h-44"
      >
        <template #extra>
          <div class="text-right leading-none self-end pb-0.5">
            <span class="text-[9px] text-muted-foreground block mb-0.5"
              >남은 여유 자금</span
            >
            <span
              class="text-[13px] font-bold text-amber-600 whitespace-nowrap"
            >
              {{ formatAmount(remainingBalance) }}
            </span>
          </div>
        </template>

        <template #footer>
          <div class="w-full mt-1">
            <div class="h-1.5 overflow-hidden rounded-full bg-amber-100">
              <div
                class="h-full transition-all duration-700 ease-out"
                :class="budgetUsageRate > 100 ? 'bg-red-500' : 'bg-amber-500'"
                :style="{ width: `${Math.min(budgetUsageRate, 100)}%` }"
              />
            </div>
            <p
              class="text-[10px] text-transparent mt-1.5 italic select-none leading-none"
            >
              Spacer
            </p>
          </div>
        </template>
      </StatCard>
    </div>

    <div class="grid gap-6 grid-cols-1 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <UiCard
          class="border-none bg-card/80 shadow-sm backdrop-blur-sm cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all h-full flex flex-col"
          @click="router.push('/statistics')"
        >
          <div class="p-6 pb-2 flex justify-between items-center">
            <div class="flex items-center gap-4">
              <div class="inline-flex p-3 bg-violet-100 rounded-2xl shrink-0">
                <PieChartIcon class="h-6 w-6 text-violet-600" />
              </div>

              <h2 class="text-lg font-bold text-foreground tracking-tight">
                카테고리별 지출 현황
              </h2>
            </div>

            <div
              class="text-xs text-muted-foreground flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity"
            >
              상세보기 <ArrowRight class="h-3 w-3" />
            </div>
          </div>

          <div class="px-6 pb-6 flex-1 flex items-center">
            <CategoryPie :data="pieData" />
          </div>
        </UiCard>
      </div>

      <div class="hidden lg:block">
        <UiCard
          class="h-full p-6 border-dashed border-2 flex items-center justify-center text-muted-foreground"
        >
          부적 위젯 추가 예정
        </UiCard>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
      <ReceiptWidget />
      <MapWidget />
      <NewsletterWidget />
    </div>
  </div>
</template>

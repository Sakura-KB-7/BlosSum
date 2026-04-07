<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { cn } from '@/shared/lib/utils';
import { TrendingDown, TrendingUp, Target, ArrowUpRight, ArrowDownRight } from 'lucide-vue-next';
import UiCard from '@/shared/ui/UiCard.vue';
import CategoryPie from '@/features/dashboard/components/CategoryPie.vue';
import {
  expenses,
  formatAmount,
  categoryInfo,
  charms,
  getMonthlyExpenses,
  getCategoryTotals,
} from '@/lib/expenses-data';

const today = new Date();
const dateLabel = computed(() =>
  new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(today)
);

const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
const lastMonth = String(prevMonthDate.getMonth() + 1).padStart(2, '0');

const currentMonthExpenses = computed(() => getMonthlyExpenses(currentMonth));
const lastMonthExpenses = computed(() => getMonthlyExpenses(lastMonth));

const currentTotal = computed(() =>
  currentMonthExpenses.value.reduce((sum, e) => sum + e.amount, 0)
);
const lastTotal = computed(() => lastMonthExpenses.value.reduce((sum, e) => sum + e.amount, 0));

const percentChange = computed(() => {
  const last = lastTotal.value;
  if (last <= 0) return '0';
  return (((currentTotal.value - last) / last) * 100).toFixed(1);
});

const categoryTotals = computed(() => getCategoryTotals(currentMonthExpenses.value));
const pieData = computed(() =>
  Object.entries(categoryTotals.value).map(([key, value]) => ({
    name: categoryInfo[key]?.name || key,
    value,
    category: key,
  }))
);

const recentExpenses = computed(() => expenses.slice(0, 5));
const todayCharm = computed(() => charms.find((c) => c.unlocked) || charms[0]);
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-foreground">환영합니다, 오늘도 좋은 하루예요 🌸</h1>
      <p class="text-muted-foreground">{{ dateLabel }}</p>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <UiCard class="border-none bg-card/80 shadow-sm backdrop-blur-sm">
        <div class="flex flex-row items-center justify-between p-6 pb-2">
          <h2 class="text-sm font-medium text-muted-foreground">이번 달 지출</h2>
          <div class="rounded-full bg-pink-100 p-2">
            <TrendingDown class="h-4 w-4 text-pink-600" />
          </div>
        </div>
        <div class="px-6 pb-6">
          <p class="text-2xl font-bold text-foreground">{{ formatAmount(currentTotal) }}</p>
          <div class="mt-1 flex items-center gap-1 text-sm">
            <template v-if="Number(percentChange) < 0">
              <ArrowDownRight class="h-4 w-4 text-green-600" />
              <span class="text-green-600">{{ Math.abs(Number(percentChange)) }}% 감소</span>
            </template>
            <template v-else>
              <ArrowUpRight class="h-4 w-4 text-pink-600" />
              <span class="text-pink-600">{{ percentChange }}% 증가</span>
            </template>
            <span class="text-muted-foreground">전월 대비</span>
          </div>
        </div>
      </UiCard>

      <UiCard class="border-none bg-card/80 shadow-sm backdrop-blur-sm">
        <div class="flex flex-row items-center justify-between p-6 pb-2">
          <h2 class="text-sm font-medium text-muted-foreground">이번 달 수입</h2>
          <div class="rounded-full bg-blue-100 p-2">
            <TrendingUp class="h-4 w-4 text-blue-600" />
          </div>
        </div>
        <div class="px-6 pb-6">
          <p class="text-2xl font-bold text-foreground">{{ formatAmount(3200000) }}</p>
          <p class="mt-1 text-sm text-muted-foreground">급여 + 부수입</p>
        </div>
      </UiCard>

      <UiCard class="border-none bg-card/80 shadow-sm backdrop-blur-sm">
        <div class="flex flex-row items-center justify-between p-6 pb-2">
          <h2 class="text-sm font-medium text-muted-foreground">저축 목표 달성률</h2>
          <div class="rounded-full bg-amber-100 p-2">
            <Target class="h-4 w-4 text-amber-600" />
          </div>
        </div>
        <div class="px-6 pb-6">
          <p class="text-2xl font-bold text-foreground">72%</p>
          <div class="mt-2 h-2 overflow-hidden rounded-full bg-amber-100">
            <div class="h-full rounded-full bg-amber-500 transition-all" style="width: 72%" />
          </div>
          <p class="mt-1 text-sm text-muted-foreground">목표 50만원 중 36만원 달성</p>
        </div>
      </UiCard>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <UiCard class="border-none bg-card/80 shadow-sm backdrop-blur-sm lg:col-span-2">
        <div class="p-6 pb-2">
          <h2 class="flex items-center gap-2 text-lg font-semibold">
            <span class="text-xl">🧾</span>
            최근 영수증
          </h2>
        </div>
        <div class="px-6 pb-6">
          <div
            class="relative rounded-xl border-2 border-dashed border-primary/30 bg-secondary/50 p-4"
          >
            <div class="absolute -top-3 left-4 bg-card px-2 text-xs text-muted-foreground">
              최근 거래 내역
            </div>
            <div class="space-y-3">
              <div
                v-for="expense in recentExpenses"
                :key="expense.id"
                class="flex items-center justify-between border-b border-dashed border-border pb-3 last:border-0 last:pb-0"
              >
                <div class="flex items-center gap-3">
                  <span
                    :class="
                      cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl text-lg',
                        categoryInfo[expense.category]?.bgColor
                      )
                    "
                  >
                    {{ expense.icon }}
                  </span>
                  <div>
                    <p class="font-medium text-foreground">{{ expense.store }}</p>
                    <p class="text-xs text-muted-foreground">{{ expense.date }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-pink-600">-{{ formatAmount(expense.amount) }}</p>
                  <span :class="cn('text-xs', categoryInfo[expense.category]?.color)">
                    {{ categoryInfo[expense.category]?.name }}
                  </span>
                </div>
              </div>
            </div>
            <RouterLink
              to="/transactions"
              class="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              json-server 거래 관리 →
            </RouterLink>
          </div>
        </div>
      </UiCard>

      <UiCard class="border-none bg-card/80 shadow-sm backdrop-blur-sm">
        <div class="p-6 pb-2">
          <h2 class="flex items-center gap-2 text-lg font-semibold">
            <span class="text-xl">🔮</span>
            오늘의 부적
          </h2>
        </div>
        <div class="flex flex-col items-center px-6 pb-6">
          <div class="group relative">
            <div
              class="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-amber-300/20 blur-xl transition-all group-hover:blur-2xl"
            />
            <div
              class="relative flex h-40 w-32 flex-col items-center justify-center rounded-2xl border-2 border-amber-300/50 bg-gradient-to-br from-amber-50 to-pink-50 shadow-lg transition-transform hover:-translate-y-1"
            >
              <span class="mb-2 text-4xl">{{ todayCharm.icon }}</span>
              <p class="text-center text-sm font-medium text-foreground">{{ todayCharm.name }}</p>
              <div
                class="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-amber-300 bg-amber-100"
              />
            </div>
          </div>
          <p class="mt-4 text-center text-sm text-muted-foreground">{{ todayCharm.description }}</p>
          <p class="mt-2 text-xs text-primary">부적을 지켜 절약 달성!</p>
        </div>
      </UiCard>
    </div>

    <UiCard class="border-none bg-card/80 shadow-sm backdrop-blur-sm">
      <div class="p-6 pb-2">
        <h2 class="flex items-center gap-2 text-lg font-semibold">
          <span class="text-xl">📊</span>
          카테고리별 지출
        </h2>
      </div>
      <div class="px-6 pb-6">
        <CategoryPie :data="pieData" />
      </div>
    </UiCard>
  </div>
</template>

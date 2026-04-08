<script setup>
import { computed, onMounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { ArrowDownRight, ArrowUpRight, Target, TrendingDown, TrendingUp } from 'lucide-vue-next';
import UiCard from '@/shared/ui/UiCard.vue';
import UiButton from '@/shared/ui/UiButton.vue';
import CategoryPie from '@/features/dashboard/components/CategoryPie.vue';
import { useBudgetStore } from '@/features/transactions/stores/budget';
import { useCategoryStore } from '@/features/transactions/stores/categories';
import { useAuthStore } from '@/stores/auth';
import { useProfileStore } from '@/stores/profile';

const router = useRouter();
const auth = useAuthStore();
const budget = useBudgetStore();
const categories = useCategoryStore();
const profile = useProfileStore();

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth() + 1;
const previousMonthDate = new Date(currentYear, today.getMonth() - 1, 1);
const previousYear = previousMonthDate.getFullYear();
const previousMonth = previousMonthDate.getMonth() + 1;

const dateLabel = computed(() =>
  new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(today)
);

const allCategories = computed(() => [...categories.income, ...categories.expense]);

const categoryMap = computed(() =>
  allCategories.value.reduce((acc, category) => {
    acc[category.id] = category;
    return acc;
  }, {})
);

function formatAmount(value) {
  return new Intl.NumberFormat('ko-KR').format(Number(value || 0)) + '원';
}

function formatDate(dateText) {
  if (!dateText) return '';
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return dateText;
  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function sumAmount(rows) {
  return rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
}

const currentMonthRows = computed(() =>
  budget.items.filter((row) => {
    const date = new Date(row.date);
    return date.getFullYear() === currentYear && date.getMonth() + 1 === currentMonth;
  })
);

const previousMonthRows = computed(() =>
  budget.items.filter((row) => {
    const date = new Date(row.date);
    return date.getFullYear() === previousYear && date.getMonth() + 1 === previousMonth;
  })
);

const currentMonthExpenses = computed(() =>
  currentMonthRows.value.filter((row) => row.type === 'expense')
);

const previousMonthExpenses = computed(() =>
  previousMonthRows.value.filter((row) => row.type === 'expense')
);

const currentMonthIncome = computed(() => currentMonthRows.value.filter((row) => row.type === 'income'));

const currentExpenseTotal = computed(() => sumAmount(currentMonthExpenses.value));
const previousExpenseTotal = computed(() => sumAmount(previousMonthExpenses.value));
const currentIncomeTotal = computed(() => sumAmount(currentMonthIncome.value));

const percentChange = computed(() => {
  const previous = previousExpenseTotal.value;
  if (previous <= 0) return '0.0';
  return (((currentExpenseTotal.value - previous) / previous) * 100).toFixed(1);
});

const monthlyBudget = computed(() => Number(profile.profile?.monthlyBudget || 0));
const remainingBudget = computed(() => Math.max(monthlyBudget.value - currentExpenseTotal.value, 0));
const budgetUsageRate = computed(() => {
  if (monthlyBudget.value <= 0) return 0;
  return Math.min((currentExpenseTotal.value / monthlyBudget.value) * 100, 100);
});

const spendingStatus = computed(() => {
  if (budgetUsageRate.value <= 50) {
    return {
      icon: '🌸',
      title: '안정적인 소비 흐름',
      description: '예산 안에서 여유 있게 관리 중입니다.',
    };
  }
  if (budgetUsageRate.value <= 85) {
    return {
      icon: '🍵',
      title: '예산 점검 구간',
      description: '이번 달 후반 지출 속도만 조금 조절하면 됩니다.',
    };
  }
  return {
    icon: '🚨',
    title: '예산 주의 구간',
    description: '남은 기간 동안 지출을 줄이는 편이 좋습니다.',
  };
});

const recentTransactions = computed(() =>
  [...budget.items]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 5)
);

const categoryTotals = computed(() =>
  currentMonthExpenses.value.reduce((acc, row) => {
    const key = row.categoryId;
    acc[key] = (acc[key] || 0) + Number(row.amount || 0);
    return acc;
  }, {})
);

const pieData = computed(() =>
  Object.entries(categoryTotals.value)
    .map(([categoryId, value]) => ({
      name: categoryMap.value[Number(categoryId)]?.name || `카테고리 ${categoryId}`,
      value,
    }))
    .sort((a, b) => b.value - a.value)
);

function categoryName(categoryId) {
  return categoryMap.value[categoryId]?.name || '미분류';
}

function categoryBubbleStyle(categoryId, type) {
  const color = categoryMap.value[categoryId]?.color || (type === 'income' ? '#93C5FD' : '#F9A8D4');
  return {
    backgroundColor: `${color}33`,
    color,
  };
}

function onLogout() {
  auth.logout();
  budget.items = [];
  profile.rows = [];
  router.push({ name: 'login' });
}

onMounted(async () => {
  await Promise.all([budget.fetchAll(), categories.fetchAll(), profile.fetchAll()]);
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">환영합니다, 오늘도 좋은 하루예요 🌸</h1>
        <p class="text-muted-foreground">{{ dateLabel }}</p>
      </div>
      <UiButton variant="outline" class="rounded-full" @click="onLogout">로그아웃</UiButton>
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
          <p class="text-2xl font-bold text-foreground">{{ formatAmount(currentExpenseTotal) }}</p>
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
          <p class="text-2xl font-bold text-foreground">{{ formatAmount(currentIncomeTotal) }}</p>
          <p class="mt-1 text-sm text-muted-foreground">
            총 {{ currentMonthIncome.length }}건의 수입이 기록되었습니다.
          </p>
        </div>
      </UiCard>

      <UiCard class="border-none bg-card/80 shadow-sm backdrop-blur-sm">
        <div class="flex flex-row items-center justify-between p-6 pb-2">
          <h2 class="text-sm font-medium text-muted-foreground">예산 사용률</h2>
          <div class="rounded-full bg-amber-100 p-2">
            <Target class="h-4 w-4 text-amber-600" />
          </div>
        </div>
        <div class="px-6 pb-6">
          <p class="text-2xl font-bold text-foreground">{{ budgetUsageRate.toFixed(1) }}%</p>
          <div class="mt-2 h-2 overflow-hidden rounded-full bg-amber-100">
            <div
              class="h-full rounded-full bg-amber-500 transition-all"
              :style="{ width: `${budgetUsageRate}%` }"
            />
          </div>
          <p class="mt-1 text-sm text-muted-foreground">
            남은 예산 {{ formatAmount(remainingBudget) }}
          </p>
        </div>
      </UiCard>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <UiCard class="border-none bg-card/80 shadow-sm backdrop-blur-sm lg:col-span-2">
        <div class="p-6 pb-2">
          <h2 class="flex items-center gap-2 text-lg font-semibold">
            <span class="text-xl">🧾</span>
            최근 거래
          </h2>
        </div>
        <div class="px-6 pb-6">
          <div
            class="relative rounded-xl border-2 border-dashed border-primary/30 bg-secondary/50 p-4"
          >
            <div class="absolute -top-3 left-4 bg-card px-2 text-xs text-muted-foreground">
              최근 거래 내역
            </div>
            <div v-if="recentTransactions.length" class="space-y-3">
              <div
                v-for="row in recentTransactions"
                :key="row.id"
                class="flex items-center justify-between border-b border-dashed border-border pb-3 last:border-0 last:pb-0"
              >
                <div class="flex items-center gap-3">
                  <span
                    class="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold"
                    :style="categoryBubbleStyle(row.categoryId, row.type)"
                  >
                    {{ row.type === 'income' ? '수입' : '지출' }}
                  </span>
                  <div>
                    <p class="font-medium text-foreground">{{ row.title }}</p>
                    <p class="text-xs text-muted-foreground">{{ formatDate(row.date) }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p :class="row.type === 'income' ? 'font-semibold text-blue-600' : 'font-semibold text-pink-600'">
                    {{ row.type === 'income' ? '+' : '-' }}{{ formatAmount(row.amount) }}
                  </p>
                  <span class="text-xs text-muted-foreground">
                    {{ categoryName(row.categoryId) }}
                  </span>
                </div>
              </div>
            </div>
            <p v-else class="py-8 text-center text-sm text-muted-foreground">
              아직 기록된 거래가 없습니다.
            </p>
            <RouterLink
              to="/transactions"
              class="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              거래 관리로 이동 →
            </RouterLink>
          </div>
        </div>
      </UiCard>

      <UiCard class="border-none bg-card/80 shadow-sm backdrop-blur-sm">
        <div class="p-6 pb-2">
          <h2 class="flex items-center gap-2 text-lg font-semibold">
            <span class="text-xl">{{ spendingStatus.icon }}</span>
            이번 달 소비 상태
          </h2>
        </div>
        <div class="flex flex-col items-center px-6 pb-6 text-center">
          <div class="group relative">
            <div
              class="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-amber-300/20 blur-xl transition-all group-hover:blur-2xl"
            />
            <div
              class="relative flex h-40 w-32 flex-col items-center justify-center rounded-2xl border-2 border-amber-300/50 bg-gradient-to-br from-amber-50 to-pink-50 shadow-lg"
            >
              <span class="mb-2 text-4xl">{{ spendingStatus.icon }}</span>
              <p class="px-3 text-center text-sm font-medium text-foreground">
                {{ spendingStatus.title }}
              </p>
            </div>
          </div>
          <p class="mt-4 text-sm text-muted-foreground">{{ spendingStatus.description }}</p>
          <p class="mt-2 text-xs text-primary">
            예산 {{ formatAmount(monthlyBudget) }} 기준으로 계산되었습니다.
          </p>
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

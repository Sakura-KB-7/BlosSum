<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  TrendingDown,
  TrendingUp,
  Target,
  ArrowDownRight,
  ArrowUpRight,
  ArrowRight,
  PieChart as PieChartIcon,
  Sparkles,
} from 'lucide-vue-next';

import UiCard from '@/shared/ui/UiCard.vue';
import PageIntroHeader from '@/components/PageIntroHeader.vue';
import StatCard from '../components/StatCard.vue';
import CategoryPie from '../components/CategoryPie.vue';
import NewsletterWidget from '../components/NewsletterWidget.vue';
import MapWidget from '../components/MapWidget.vue';
import ReceiptWidget from '../components/ReceiptWidget.vue';

import { useBudgetStore } from '@/features/transactions/stores/budget';
import { useCategoryStore } from '@/features/transactions/stores/categories';

import { useAuthStore } from '@/stores/auth';
import { cn } from '@/shared/lib/utils';

const router = useRouter();
const budget = useBudgetStore();
const categories = useCategoryStore();

const latestCharm = ref(null);

// 날짜 데이터
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth() + 1;

// 전월 데이터
const previousMonthDate = new Date(currentYear, today.getMonth() - 1, 1);
const previousYear = previousMonthDate.getFullYear();
const previousMonth = previousMonthDate.getMonth() + 1;

const formatAmount = (val) => new Intl.NumberFormat('ko-KR').format(Number(val || 0)) + '원';

// 내역 필터링
const currentMonthRows = computed(() =>
  budget.items.filter((row) => {
    const d = new Date(row.date);
    return d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth;
  })
);

const previousMonthRows = computed(() =>
  budget.items.filter((row) => {
    const d = new Date(row.date);
    return d.getFullYear() === previousYear && d.getMonth() + 1 === previousMonth;
  })
);

// 합계 계산
const currentIncomeTotal = computed(() =>
  currentMonthRows.value
    .filter((r) => r.type === 'income')
    .reduce((s, r) => s + Number(r.amount || 0), 0)
);

const currentExpenseTotal = computed(() =>
  currentMonthRows.value
    .filter((r) => r.type === 'expense')
    .reduce((s, r) => s + Number(r.amount || 0), 0)
);

const previousExpenseTotal = computed(() =>
  previousMonthRows.value
    .filter((r) => r.type === 'expense')
    .reduce((s, r) => s + Number(r.amount || 0), 0)
);

const percentChange = computed(() => {
  const prev = previousExpenseTotal.value;
  if (prev <= 0) return '0.0';
  return (((currentExpenseTotal.value - prev) / prev) * 100).toFixed(1);
});

const budgetUsageRate = computed(() => {
  const income = currentIncomeTotal.value;
  if (!income || income <= 0) return 0;
  return (currentExpenseTotal.value / income) * 100;
});

const remainingBalance = computed(() =>
  Math.max(currentIncomeTotal.value - currentExpenseTotal.value, 0)
);

// 차트 데이터
const categoryMap = computed(() =>
  [...categories.income, ...categories.expense].reduce((acc, c) => ({ ...acc, [c.id]: c }), {})
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

// [동기화] 부적 스타일 맵 (제작소와 동일하게 업데이트)
const getThemeClass = (themeId) => {
  const maps = {
    pink: 'bg-gradient-to-br from-[#FFF0F6] to-[#FFE0EC] text-[#3C3028]',
    gold: 'bg-gradient-to-br from-[#FFFBF0] to-[#FFF5DC] text-[#3C3028]',
    mint: 'bg-gradient-to-br from-[#F0FFF8] to-[#DCFFF0] text-[#3C3028]',
    sky: 'bg-gradient-to-br from-[#F0F8FF] to-[#DDF0FF] text-[#3C3028]',
    purple: 'bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] text-[#3C3028]',
    peach: 'bg-gradient-to-br from-[#FFF5F1] to-[#FFE4D5] text-[#3C3028]',
    midnight: 'bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-white',
    lavender: 'bg-gradient-to-br from-[#F3E8FF] to-[#E9D5FF] text-[#3C3028]',
    sunset: 'bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] text-[#3C3028]',
    forest: 'bg-gradient-to-br from-[#D1FAE5] to-[#A7F3D0] text-[#166534]',
    ocean: 'bg-gradient-to-br from-[#E0F2FE] to-[#BAE6FD] text-[#0369A1]',
    berry: 'bg-gradient-to-br from-[#FCE7F3] to-[#FBCFE8] text-[#9D174D]',
  };
  return maps[themeId] || maps.pink;
};

// [동기화] 이모지 맵 확장 (전체 리스트 반영)
const emojiMap = {
  koala: '🐨',
  dragon: '🐲',
  clover: '🍀',
  rabbit: '🐰',
  cat: '🐱',
  money: '💰',
  star: '⭐',
  heart: '💖',
  bird: '🕊️',
  moon: '🌙',
  sun: '☀️',
  peach: '🍑',
  dog: '🐶',
  fox: '🦊',
  owl: '🦉',
  unicorn: '🦄',
};

// [동기화] 프레임 스타일 정보
const frames = [
  { id: 'dashed', class: 'border-[3px] border-dashed border-black/20' },
  { id: 'double', class: 'border-double border-[6px] border-black/15' },
  {
    id: 'wavy',
    class: 'border-[10px]',
    style:
      "border-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2730%27 height=%2710%27 viewBox=%270 0 30 10%27%3E%3Cpath d=%27M0 5c5 0 5-5 10-5s5 5 10 5 5-5 10-5%27 stroke=%27%23000%27 stroke-opacity=%270.3%27 fill=%27none%27 stroke-width=%272%27/%3E%3C/svg%3E') 10 repeat;",
  },
  {
    id: 'zigZag',
    class: 'border-[12px]',
    style:
      "border-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2720%27 height=%2720%27 viewBox=%270 0 20 20%27%3E%3Cpolygon points=%2710,0 20,10 10,20 0,10%27 fill=%27%23000%27 fill-opacity=%270.2%27/%3E%3C/svg%3E') 10 repeat;",
  },
  {
    id: 'neon',
    class: 'border-[3px] border-pink-400 shadow-[0_0_15px_rgba(244,114,182,0.6)]',
  },
  {
    id: 'ornate',
    class: 'border-[12px]',
    style:
      "border-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2740%27 height=%2740%27 viewBox=%270 0 40 40%27%3E%3Cpath d=%27M20 5l5 10h10l-8 7 3 10-10-6-10 6 3-10-8-7h10z%27 fill=%27%23000%27 fill-opacity=%270.25%27/%3E%3C/svg%3E') 15 repeat;",
  },
  {
    id: 'traditional',
    class: 'border-[12px]',
    style:
      "border-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2720%27 height=%2720%27 viewBox=%270 0 20 20%27%3E%3Cpath d=%27M10 0v20M0 10h20M5 5l10 10M5 15L15 5%27 stroke=%27%23000%27 stroke-opacity=%270.4%27 fill=%27none%27 stroke-width=%272%27/%3E%3C/svg%3E') 10 repeat;",
  },
  {
    id: 'sparkle',
    class: 'border-[5px] border-dotted border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]',
  },
];

// [동기화] 프레임 보정 함수
const getAdjustedFrame = (frameId, themeId) => {
  const frame = frames.find((f) => f.id === frameId) || frames[0];
  let className = frame.class;
  let style = frame.style || '';
  const isDark = ['midnight', 'forest', 'ocean', 'berry'].includes(themeId);
  if (isDark) {
    className = className.replace(/black/g, 'white').replace(/opacity-0.2/g, 'opacity-0.5');
    style = style.replace(/%23000/g, '%23FFF');
  }
  return { className, style };
};

onMounted(async () => {
  await Promise.all([budget.fetchAll(), categories.fetchAll()]);
  const charmData = localStorage.getItem('my-saved-charms');
  if (charmData) {
    const charms = JSON.parse(charmData);
    if (charms.length > 0) latestCharm.value = charms[0];
  }
});
</script>

<template>
  <div class="space-y-6 max-w-full mx-auto pb-10">
    <PageIntroHeader
      title="내 지갑 대시보드 🌸"
      description="이번 달 수입·지출·소비율과 핵심 위젯을 한눈에 확인해보세요."
    />

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
              <span class="text-green-600">{{ Math.abs(percentChange) }}% 감소</span>
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
            * 이번 달 기록된 수입 합계입니다.
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
            <span class="text-[9px] text-muted-foreground block mb-0.5">남은 여유 자금</span>
            <span class="text-[13px] font-bold text-amber-600 whitespace-nowrap">{{
              formatAmount(remainingBalance)
            }}</span>
          </div>
        </template>
        <template #footer>
          <div class="w-full mt-1">
            <div class="h-1.5 overflow-hidden rounded-full bg-amber-100">
              <div
                class="h-full transition-all duration-700"
                :class="budgetUsageRate > 100 ? 'bg-red-500' : 'bg-amber-500'"
                :style="{ width: `${Math.min(budgetUsageRate, 100)}%` }"
              />
            </div>
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
              <h2 class="text-lg font-bold text-foreground tracking-tight">카테고리별 지출 현황</h2>
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
          class="h-full border-none bg-card/80 shadow-sm backdrop-blur-sm cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all flex flex-col overflow-hidden group relative"
          @click="router.push('/amulet')"
        >
          <div
            class="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-100 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none"
          ></div>
          <div
            class="absolute -top-10 -left-10 w-32 h-32 bg-pink-100 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none"
          ></div>

          <div class="p-6 pb-2 flex justify-between items-center relative z-10">
            <div class="flex items-center gap-4">
              <div
                class="inline-flex p-3 bg-amber-100 rounded-2xl shrink-0 group-hover:bg-amber-200 transition-colors shadow-inner"
              >
                <Sparkles class="h-6 w-6 text-amber-600" />
              </div>
              <h2 class="text-lg font-bold text-foreground tracking-tight">부적 꾸미기</h2>
            </div>
            <div
              class="text-xs text-muted-foreground flex items-center gap-1 opacity-80 group-hover:opacity-100 group-hover:text-primary transition-all"
            >
              꾸미러 가기 <ArrowRight class="h-3 w-3" />
            </div>
          </div>

          <div class="px-6 pb-4 flex-1 flex items-center justify-center relative z-10">
            <div
              v-if="latestCharm"
              :class="
                cn(
                  'w-40 h-60 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-6 text-center border-4 border-white relative transition-all duration-500 group-hover:scale-105 group-hover:rotate-1 z-20',
                  getThemeClass(latestCharm.colorTheme)
                )
              "
            >
              <div
                :class="
                  cn(
                    'absolute inset-3 rounded-[24px] pointer-events-none',
                    getAdjustedFrame(latestCharm.frameStyle, latestCharm.colorTheme).className
                  )
                "
                :style="getAdjustedFrame(latestCharm.frameStyle, latestCharm.colorTheme).style"
              ></div>

              <span
                class="text-6xl mb-4 relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform duration-500"
              >
                {{ emojiMap[latestCharm.character] }}
              </span>
              <p
                class="text-xs font-black leading-snug italic relative z-10 line-clamp-4 break-keep"
              >
                {{ latestCharm.message }}
              </p>
            </div>

            <div
              v-else
              class="text-center flex flex-col items-center relative group-hover:scale-105 transition-transform duration-500 z-20"
            >
              <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div class="w-48 h-64 bg-amber-100/30 rounded-full blur-2xl animate-pulse"></div>
              </div>
              <div
                class="w-40 h-60 rounded-3xl border-4 border-dashed border-amber-300 bg-amber-50/70 shadow-2xl flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
              >
                <div
                  class="absolute inset-0 opacity-[0.06] text-[8px] flex flex-wrap gap-1 p-3 select-none pointer-events-none"
                >
                  ✨ 🌟 💫 ✨ 🌟 💫 ✨ 🌟 💫 ✨ 🌟 💫
                </div>
                <div
                  class="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-8 bg-pink-50/80 rounded-t-full border-2 border-white shadow-md z-10"
                ></div>
                <div class="relative z-10 mb-4">
                  <Sparkles
                    class="absolute -inset-6 h-20 w-20 text-amber-300 opacity-40 group-hover:opacity-100 group-hover:scale-125 transition-all duration-1000"
                  />
                  <span class="text-6xl relative z-20 drop-shadow-xl group-hover:animate-pulse"
                    >🔮</span
                  >
                </div>
                <div
                  class="relative z-10 text-amber-950 font-black italic tracking-tighter leading-tight"
                >
                  <p class="text-[11px]">행운의 주문을</p>
                  <p class="text-[9px] text-amber-900/60 font-bold">비워두었어요</p>
                </div>
              </div>
            </div>
          </div>

          <div class="pb-6 text-center relative z-30">
            <p
              class="text-xs text-muted-foreground font-medium italic group-hover:text-primary transition-colors"
            >
              여기를 눌러 행운을 채우세요! 🌸
            </p>
          </div>
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

<style scoped>
@keyframes pulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.05);
  }
}
.animate-pulse {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import UiCard from '@/shared/ui/UiCard.vue';
import UiButton from '@/shared/ui/UiButton.vue';
import { useBudgetStore } from '@/features/transactions/stores/budget';
import { useCategoryStore } from '@/features/transactions/stores/categories';
import { cn } from '@/shared/lib/utils';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS = [
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
  '10월',
  '11월',
  '12월',
];
const budget = useBudgetStore();
const categoryStore = useCategoryStore();
const router = useRouter();
onMounted(async () => {
  await Promise.all([budget.fetchAll(), categoryStore.fetchAll()]);
});
const now = new Date();
const currentDate = ref(new Date(now.getFullYear(), now.getMonth(), 1));
const selectedDate = ref(
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
);
const showPanel = ref(false);

const year = computed(() => currentDate.value.getFullYear());
const month = computed(() => currentDate.value.getMonth());
const firstDayOfMonth = computed(() => new Date(year.value, month.value, 1).getDay());
const daysInMonth = computed(() => new Date(year.value, month.value + 1, 0).getDate());
const monthStr = computed(() => String(month.value + 1).padStart(2, '0'));

const monthExpenses = computed(() =>
  budget.items.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === year.value && d.getMonth() + 1 === month.value + 1;
  })
);

const expensesByDay = computed(() => {
  const map = {};
  monthExpenses.value.forEach((e) => {
    if (!map[e.date]) map[e.date] = [];
    map[e.date].push(e);
  });
  return map;
});

function getDayNet(dayStr) {
  return (expensesByDay.value[dayStr] || []).reduce((sum, e) => {
    const amount = Number(e.amount || 0);
    return e.type === 'income' ? sum + amount : sum - amount;
  }, 0);
}

function prevMonth() {
  currentDate.value = new Date(year.value, month.value - 1, 1);
}

function nextMonth() {
  currentDate.value = new Date(year.value, month.value + 1, 1);
}

function onDayClick(day) {
  const dayStr = `${year.value}-${monthStr.value}-${String(day).padStart(2, '0')}`;
  selectedDate.value = dayStr;
  showPanel.value = true;
}

function onAddTransaction() {
  router.push({ name: 'transaction-new', query: { date: selectedDate.value } });
}

const selectedExpenses = computed(() =>
  selectedDate.value ? expensesByDay.value[selectedDate.value] || [] : []
);

function formatAmount(value) {
  return new Intl.NumberFormat('ko-KR').format(Number(value || 0)) + '원';
}

function selectedDateLabel(dateIso) {
  if (!dateIso) return '';
  const [y, m, d] = String(dateIso).split('-');
  if (!y || !m || !d) return dateIso;
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}

const calendarCells = computed(() => {
  const cells = [];
  for (let i = 0; i < firstDayOfMonth.value; i++) cells.push({ kind: 'blank' });
  const t = new Date();
  for (let day = 1; day <= daysInMonth.value; day++) {
    const dayStr = `${year.value}-${monthStr.value}-${String(day).padStart(2, '0')}`;
    cells.push({
      kind: 'day',
      day,
      dayStr,
      total: getDayNet(dayStr),
      selected: selectedDate.value === dayStr,
      isToday:
        day === t.getDate() && month.value === t.getMonth() && year.value === t.getFullYear(),
    });
  }
  return cells;
});
</script>

<template>
  <div class="flex flex-col gap-6 lg:flex-row">
    <div class="min-w-0 flex-1 space-y-4">
      <div class="relative z-[60] flex flex-wrap items-center justify-between gap-2">
        <h1 class="text-2xl font-bold text-foreground">캘린더 가계부 📅</h1>
        <UiButton
          class="relative z-[60] shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          @click="onAddTransaction"
        >
          <Plus class="mr-1 h-4 w-4" />
          거래 추가
        </UiButton>
      </div>

      <UiCard
        class="border-none bg-card/80 shadow-sm backdrop-blur-sm lg:h-[calc(100vh-11rem)] lg:overflow-hidden"
      >
        <div class="flex flex-row items-center justify-between p-6">
          <UiButton variant="ghost" size="icon" @click="prevMonth">
            <ChevronLeft class="h-5 w-5" />
          </UiButton>
          <h2 class="text-lg font-semibold">{{ year }}년 {{ MONTHS[month] }}</h2>
          <UiButton variant="ghost" size="icon" @click="nextMonth">
            <ChevronRight class="h-5 w-5" />
          </UiButton>
        </div>
        <div class="px-6 pb-6 lg:flex-1 lg:overflow-auto">
          <div class="mb-2 grid grid-cols-7 gap-1">
            <div
              v-for="d in DAYS"
              :key="d"
              :class="
                cn(
                  'py-2 text-center text-sm font-medium',
                  d === '일' && 'text-red-500',
                  d === '토' && 'text-blue-500'
                )
              "
            >
              {{ d }}
            </div>
          </div>
          <div class="grid grid-cols-7 gap-1">
            <template v-for="(cell, idx) in calendarCells">
              <div
                v-if="cell.kind === 'blank'"
                :key="`blank-${idx}`"
                class="aspect-square w-full"
              />
              <button
                v-else
                :key="`day-${cell.dayStr}`"
                type="button"
                :class="
                  cn(
                    'flex aspect-square w-full flex-col items-start rounded-xl border p-1 text-left transition-all hover:border-primary/50 sm:p-2',
                    cell.selected ? 'border-primary bg-primary/5' : 'border-transparent bg-card/50',
                    cell.isToday && 'ring-2 ring-primary ring-offset-2'
                  )
                "
                @click="onDayClick(cell.day)"
              >
                <span
                  :class="
                    cn(
                      'text-sm font-medium',
                      cell.isToday &&
                        'flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground'
                    )
                  "
                >
                  {{ cell.day }}
                </span>
                <span
                  v-if="cell.total !== 0"
                  :class="
                    cn(
                      'mt-auto text-xs font-medium',
                      cell.total > 0 ? 'text-blue-600' : 'text-pink-600'
                    )
                  "
                >
                  {{ cell.total > 0 ? '+' : '-' }}{{ (Math.abs(cell.total) / 10000).toFixed(1) }}만
                </span>
              </button>
            </template>
          </div>
        </div>
      </UiCard>
    </div>

    <aside class="hidden w-80 shrink-0 lg:block">
      <UiCard
        class="sticky top-6 border-none bg-card/80 shadow-sm backdrop-blur-sm lg:h-[calc(100vh-11rem)]"
      >
        <div v-if="showPanel" class="flex h-full flex-col">
          <div class="flex items-center justify-between border-b border-border p-4">
            <h3 class="font-semibold text-foreground">
              {{ selectedDateLabel(selectedDate) }} 내역
            </h3>
            <UiButton variant="ghost" size="icon" @click="showPanel = false">
              <X class="h-4 w-4" />
            </UiButton>
          </div>
          <div class="flex-1 overflow-auto p-4">
            <div v-if="selectedExpenses.length > 0" class="space-y-3">
              <div
                v-for="expense in selectedExpenses"
                :key="expense.id"
                class="rounded-xl border border-border bg-background p-3"
              >
                <div class="flex items-center gap-3">
                  <span
                    class="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-lg"
                  >
                    {{ expense.type === 'income' ? '💰' : '💸' }}
                  </span>
                  <div class="flex-1">
                    <p class="font-medium text-foreground">
                      {{ expense.title }}
                    </p>
                    <p class="text-xs text-muted-foreground">
                      {{ expense.paymentMethod }} · {{ expense.memo }}
                    </p>
                  </div>
                  <p :class="expense.type === 'income' ? 'text-blue-600' : 'text-pink-600'">
                    {{ expense.type === 'income' ? '+' : '-'
                    }}{{ expense.amount.toLocaleString() }}원
                  </p>
                </div>
              </div>
              <div class="mt-4 rounded-xl bg-primary/10 p-3 text-center">
                <p class="text-sm text-muted-foreground">선택일 총합</p>
                <p class="text-xl font-bold text-primary">
                  {{ formatAmount(selectedExpenses.reduce((sum, e) => sum + e.amount, 0)) }}
                </p>
              </div>
            </div>
            <div
              v-else
              class="flex h-40 flex-col items-center justify-center text-muted-foreground"
            >
              <span class="text-4xl">🌸</span>
              <p class="mt-2">거래 내역이 없습니다</p>
              <p class="text-sm">다른 날짜를 선택해 주세요</p>
            </div>
          </div>
        </div>
        <div
          v-else
          class="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground"
        >
          <span class="text-4xl">📅</span>
          <p class="text-center text-sm">날짜를 클릭하면 일별 결제내역이 여기 표시됩니다.</p>
        </div>
      </UiCard>
    </aside>

    <div
      v-if="showPanel"
      class="fixed inset-y-0 right-0 z-40 h-full w-80 max-w-[85vw] border-l border-border bg-card/95 shadow-xl backdrop-blur-sm lg:hidden"
    >
      <div class="flex h-full flex-col">
        <div class="flex items-center justify-between border-b border-border p-4">
          <h3 class="font-semibold text-foreground">{{ selectedDateLabel(selectedDate) }} 내역</h3>
          <UiButton variant="ghost" size="icon" @click="showPanel = false">
            <X class="h-4 w-4" />
          </UiButton>
        </div>
        <div class="flex-1 overflow-auto p-4">
          <div v-if="selectedExpenses.length > 0" class="space-y-3">
            <div
              v-for="expense in selectedExpenses"
              :key="expense.id"
              class="rounded-xl border border-border bg-background p-3"
            >
              <div class="flex items-center gap-3">
                <span
                  class="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-lg"
                >
                  {{ expense.type === 'income' ? '💰' : '💸' }}
                </span>
                <div class="flex-1">
                  <p class="font-medium text-foreground">{{ expense.title }}</p>
                  <p class="text-xs text-muted-foreground">
                    {{ expense.paymentMethod }} · {{ expense.memo }}
                  </p>
                </div>
                <p :class="expense.type === 'income' ? 'text-blue-600' : 'text-pink-600'">
                  {{ expense.type === 'income' ? '+' : '-' }}{{ expense.amount.toLocaleString() }}원
                </p>
              </div>
            </div>
            <div class="mt-4 rounded-xl bg-primary/10 p-3 text-center">
              <p class="text-sm text-muted-foreground">선택일 총합</p>
              <p class="text-xl font-bold text-primary">
                {{ formatAmount(selectedExpenses.reduce((sum, e) => sum + e.amount, 0)) }}
              </p>
            </div>
          </div>
          <div v-else class="flex h-40 flex-col items-center justify-center text-muted-foreground">
            <span class="text-4xl">🌸</span>
            <p class="mt-2">거래 내역이 없습니다</p>
            <p class="text-sm">다른 날짜를 선택해 주세요</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

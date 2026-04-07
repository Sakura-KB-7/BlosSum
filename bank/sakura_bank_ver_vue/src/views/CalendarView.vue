<script setup lang="ts">
import { computed, ref } from 'vue';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-vue-next';
import UiCard from '@/shared/ui/UiCard.vue';
import UiButton from '@/shared/ui/UiButton.vue';
import { expenses, formatAmount, categoryInfo, type Expense } from '@/lib/expenses-data';
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

const now = new Date();
const currentDate = ref(new Date(now.getFullYear(), now.getMonth(), 1));
const selectedDate = ref<string | null>(
  `${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`
);
const showPanel = ref(false);

const year = computed(() => currentDate.value.getFullYear());
const month = computed(() => currentDate.value.getMonth());
const firstDayOfMonth = computed(() => new Date(year.value, month.value, 1).getDay());
const daysInMonth = computed(() => new Date(year.value, month.value + 1, 0).getDate());
const monthStr = computed(() => String(month.value + 1).padStart(2, '0'));

const monthExpenses = computed(() => expenses.filter((e) => e.date.startsWith(monthStr.value)));

const expensesByDay = computed(() => {
  const map: Record<string, Expense[]> = {};
  monthExpenses.value.forEach((e) => {
    const day = e.date.split(' ')[0];
    if (!map[day]) map[day] = [];
    map[day].push(e);
  });
  return map;
});

function getDayTotal(dayStr: string) {
  return (expensesByDay.value[dayStr] || []).reduce((sum, e) => sum + e.amount, 0);
}

function prevMonth() {
  currentDate.value = new Date(year.value, month.value - 1, 1);
}

function nextMonth() {
  currentDate.value = new Date(year.value, month.value + 1, 1);
}

function onDayClick(day: number) {
  const dayStr = `${monthStr.value}.${String(day).padStart(2, '0')}`;
  selectedDate.value = dayStr;
  showPanel.value = true;
}

const selectedExpenses = computed(() =>
  selectedDate.value ? expensesByDay.value[selectedDate.value] || [] : []
);

type CalCell =
  | { kind: 'blank' }
  | {
      kind: 'day';
      day: number;
      dayStr: string;
      total: number;
      selected: boolean;
      isToday: boolean;
    };

const calendarCells = computed((): CalCell[] => {
  const cells: CalCell[] = [];
  for (let i = 0; i < firstDayOfMonth.value; i++) cells.push({ kind: 'blank' });
  const t = new Date();
  for (let day = 1; day <= daysInMonth.value; day++) {
    const dayStr = `${monthStr.value}.${String(day).padStart(2, '0')}`;
    cells.push({
      kind: 'day',
      day,
      dayStr,
      total: getDayTotal(dayStr),
      selected: selectedDate.value === dayStr,
      isToday:
        day === t.getDate() && month.value === t.getMonth() && year.value === t.getFullYear(),
    });
  }
  return cells;
});
</script>

<template>
  <div class="flex gap-6">
    <div :class="cn('flex-1 space-y-4', showPanel && 'lg:mr-80')">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-foreground">캘린더 가계부 📅</h1>
        <div class="flex gap-2">
          <UiButton
            variant="outline"
            class="rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
          >
            <Plus class="mr-1 h-4 w-4" />
            수입 추가
          </UiButton>
          <UiButton class="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus class="mr-1 h-4 w-4" />
            지출 추가
          </UiButton>
        </div>
      </div>

      <UiCard class="border-none bg-card/80 shadow-sm backdrop-blur-sm">
        <div class="flex flex-row items-center justify-between p-6">
          <UiButton variant="ghost" size="icon" @click="prevMonth">
            <ChevronLeft class="h-5 w-5" />
          </UiButton>
          <h2 class="text-lg font-semibold">{{ year }}년 {{ MONTHS[month] }}</h2>
          <UiButton variant="ghost" size="icon" @click="nextMonth">
            <ChevronRight class="h-5 w-5" />
          </UiButton>
        </div>
        <div class="px-6 pb-6">
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
            <template v-for="(cell, idx) in calendarCells" :key="idx">
              <div v-if="cell.kind === 'blank'" class="h-20 md:h-24" />
              <button
                v-else
                type="button"
                :class="
                  cn(
                    'flex h-20 flex-col items-start rounded-xl border p-2 text-left transition-all hover:border-primary/50 md:h-24',
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
                <span v-if="cell.total > 0" class="mt-auto text-xs font-medium text-pink-600">
                  -{{ (cell.total / 10000).toFixed(1) }}만
                </span>
              </button>
            </template>
          </div>
        </div>
      </UiCard>

      <UiCard class="border-none bg-card/80 shadow-sm backdrop-blur-sm">
        <div class="p-6 pb-2">
          <h2 class="text-lg font-semibold">{{ MONTHS[month] }} 요약</h2>
        </div>
        <div class="px-6 pb-6">
          <div class="flex flex-wrap justify-center gap-4">
            <template v-for="(info, key) in categoryInfo" :key="key">
              <div
                v-if="
                  monthExpenses
                    .filter((e) => e.category === key)
                    .reduce((s, e) => s + e.amount, 0) > 0
                "
                :class="cn('rounded-xl px-4 py-3 text-center', info.bgColor)"
              >
                <p :class="cn('text-sm font-medium', info.color)">{{ info.name }}</p>
                <p class="text-lg font-bold text-foreground">
                  {{
                    (
                      monthExpenses
                        .filter((e) => e.category === key)
                        .reduce((s, e) => s + e.amount, 0) / 10000
                    ).toFixed(1)
                  }}만원
                </p>
              </div>
            </template>
          </div>
        </div>
      </UiCard>
    </div>

    <div
      v-if="showPanel"
      class="fixed right-0 top-0 z-50 h-full w-80 border-l border-border bg-card/95 shadow-xl backdrop-blur-sm lg:relative lg:z-auto"
    >
      <div class="flex h-full flex-col">
        <div class="flex items-center justify-between border-b border-border p-4">
          <h3 class="font-semibold text-foreground">
            {{ selectedDate?.replace('.', '월 ') }}일 내역
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
                  :class="
                    cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl text-lg',
                      categoryInfo[expense.category]?.bgColor
                    )
                  "
                >
                  {{ expense.icon }}
                </span>
                <div class="flex-1">
                  <p class="font-medium text-foreground">{{ expense.store }}</p>
                  <p class="text-xs text-muted-foreground">{{ expense.date.split(' ')[1] }}</p>
                </div>
                <p class="font-semibold text-pink-600">-{{ formatAmount(expense.amount) }}</p>
              </div>
            </div>
            <div class="mt-4 rounded-xl bg-primary/10 p-3 text-center">
              <p class="text-sm text-muted-foreground">총 지출</p>
              <p class="text-xl font-bold text-primary">
                {{ formatAmount(selectedExpenses.reduce((sum, e) => sum + e.amount, 0)) }}
              </p>
            </div>
          </div>
          <div v-else class="flex h-40 flex-col items-center justify-center text-muted-foreground">
            <span class="text-4xl">🌸</span>
            <p class="mt-2">지출 내역이 없습니다</p>
            <p class="text-sm">무지출 데이! 축하해요!</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

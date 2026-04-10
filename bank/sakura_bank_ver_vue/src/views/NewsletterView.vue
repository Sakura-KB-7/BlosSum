<script setup>
import { Sparkles, Wallet, Landmark, TrendingUp, ExternalLink } from 'lucide-vue-next';
import { computed, onMounted, ref, watch } from 'vue';
import UiCard from '@/shared/ui/UiCard.vue';
import UiButton from '@/shared/ui/UiButton.vue';
import { cn } from '@/shared/lib/utils';
import { useBudgetStore } from '@/features/transactions/stores/budget';
import { useCategoryStore } from '@/features/transactions/stores/categories';
import { useProfileStore } from '@/stores/profile';
import { useAuthStore } from '@/stores/auth';
import { generateNewsletter } from '@/features/newsletter/api/generateNewsletter';

const budgetStore = useBudgetStore();
const categoryStore = useCategoryStore();
const profileStore = useProfileStore();
const auth = useAuthStore();

const NEWSLETTER_LS_PREFIX = 'blosum_newsletter_v1_';

function newsletterStorageKey() {
  const id = String(auth.currentUserId || '').trim() || 'guest';
  return `${NEWSLETTER_LS_PREFIX}${id}`;
}

function loadPersistedNewsletter() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(newsletterStorageKey());
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.cards) || data.cards.length === 0) return;
    generatedCards.value = data.cards;
    generatedAt.value = typeof data.generatedAt === 'string' ? data.generatedAt : '';
  } catch {
    // 손상된 캐시 무시
  }
}

function persistNewsletter() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      newsletterStorageKey(),
      JSON.stringify({
        cards: generatedCards.value,
        generatedAt: generatedAt.value,
      })
    );
  } catch {
    // 용량 초과 등
  }
}

const generatedCards = ref([]);
const isGenerating = ref(false);
const errorMessage = ref('');
const generatedAt = ref('');

function toDateOnlyKey(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildDateSetFromOffset(startOffsetDays, endOffsetDays) {
  const set = new Set();
  const today = new Date();
  for (let offset = startOffsetDays; offset <= endOffsetDays; offset += 1) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    set.add(toDateOnlyKey(d));
  }
  return set;
}

function formatWon(value) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`;
}

const categoryNameMap = computed(() => {
  const map = new Map();
  for (const c of categoryStore.income) map.set(c.id, c.name);
  for (const c of categoryStore.expense) map.set(c.id, c.name);
  return map;
});

const expenseRows = computed(() => budgetStore.items.filter((row) => row.type === 'expense'));

const thisWeekSet = computed(() => buildDateSetFromOffset(-6, 0));
const lastWeekSet = computed(() => buildDateSetFromOffset(-13, -7));

const thisWeekRows = computed(() =>
  expenseRows.value.filter((row) => thisWeekSet.value.has(String(row.date).slice(0, 10)))
);

const lastWeekRows = computed(() =>
  expenseRows.value.filter((row) => lastWeekSet.value.has(String(row.date).slice(0, 10)))
);

const currentMonthExpense = computed(() => {
  const now = new Date();
  return budgetStore.monthlyTotals(now.getFullYear(), now.getMonth() + 1).expense;
});

const topCategories = computed(() => {
  const totals = new Map();
  for (const row of thisWeekRows.value) {
    const prev = totals.get(row.categoryId) || 0;
    totals.set(row.categoryId, prev + Number(row.amount || 0));
  }
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([categoryId]) => categoryNameMap.value.get(categoryId) || `카테고리#${categoryId}`);
});

const spendingSignals = computed(() => {
  const signals = [];
  const thisWeekTotal = thisWeekRows.value.reduce((acc, row) => acc + Number(row.amount || 0), 0);
  const lastWeekTotal = lastWeekRows.value.reduce((acc, row) => acc + Number(row.amount || 0), 0);

  if (lastWeekTotal > 0 && thisWeekTotal >= lastWeekTotal * 1.2) {
    signals.push('weekly_spend_rising');
  } else if (lastWeekTotal === 0 && thisWeekTotal > 0) {
    signals.push('recent_activity_started');
  }

  const budget = Number(profileStore.profile?.monthlyBudget || 0);
  if (budget > 0 && currentMonthExpense.value / budget >= 0.85) {
    signals.push('budget_pressure_high');
  }

  const byCategory = new Map();
  for (const row of thisWeekRows.value) {
    const prev = byCategory.get(row.categoryId) || 0;
    byCategory.set(row.categoryId, prev + Number(row.amount || 0));
  }
  const top = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0];
  if (top && thisWeekTotal > 0 && top[1] / thisWeekTotal >= 0.45) {
    signals.push('single_category_heavy');
  }
  if (top) {
    const topName = categoryNameMap.value.get(top[0]) || '';
    if (topName.includes('식')) signals.push('high_food_spending');
    if (topName.includes('교통')) signals.push('transport_cost_rising');
  }
  if (signals.length === 0) signals.push('stable_spending_pattern');
  return [...new Set(signals)];
});

const SIGNAL_LABELS = {
  weekly_spend_rising: {
    title: '주간 지출 증가',
    detail: '이번 주 합계가 지난주보다 20% 이상 커졌어요.',
  },
  high_food_spending: {
    title: '식비 비중 큼',
    detail: '이번 주 지출에서 식비·외식 쪽이 두드러져요.',
  },
  transport_cost_rising: { title: '교통비 주목', detail: '교통 관련 지출이 상대적으로 높아요.' },
  stable_spending_pattern: { title: '지출 리듬 안정', detail: '최근 패턴이 무난한 편이에요.' },
  budget_pressure_high: {
    title: '예산 여유 낮음',
    detail: '이번 달 누적 지출이 예산의 85%를 넘겼어요.',
  },
  single_category_heavy: {
    title: '한 카테고리 집중',
    detail: '이번 주 지출의 절반 가까이가 특정 항목에 몰려 있어요.',
  },
  recent_activity_started: {
    title: '기록 시작 구간',
    detail: '최근에 거래가 새로 쌓이기 시작했어요.',
  },
};

const signalDisplayList = computed(() =>
  spendingSignals.value.map((key) => ({
    key,
    title: SIGNAL_LABELS[key]?.title || key,
    detail: SIGNAL_LABELS[key]?.detail || '',
  }))
);

const weeklyInsights = computed(() => {
  const thisMap = new Map();
  const prevMap = new Map();

  for (const row of thisWeekRows.value) {
    const prev = thisMap.get(row.categoryId) || 0;
    thisMap.set(row.categoryId, prev + Number(row.amount || 0));
  }
  for (const row of lastWeekRows.value) {
    const prev = prevMap.get(row.categoryId) || 0;
    prevMap.set(row.categoryId, prev + Number(row.amount || 0));
  }

  const rows = [...thisMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([categoryId, thisAmount]) => {
      const prevAmount = prevMap.get(categoryId) || 0;
      const change =
        prevAmount === 0 ? 100 : Math.round(((thisAmount - prevAmount) / prevAmount) * 100);
      return {
        label: categoryNameMap.value.get(categoryId) || `카테고리#${categoryId}`,
        change,
        trend: change <= 0 ? 'down' : 'up',
      };
    });

  if (rows.length === 0) {
    return [{ label: '지출 데이터', change: 0, trend: 'down' }];
  }
  return rows;
});

const overviewText = computed(() => {
  if (topCategories.value.length === 0) {
    return '거래 데이터를 불러온 뒤 AI 소식지를 생성하면 맞춤형 카드가 표시됩니다.';
  }
  return `이번 주 소비 패턴을 분석한 결과, ${topCategories.value.join(', ')} 중심 지출이 보입니다. 아래 버튼으로 맞춤 소식지를 생성해보세요.`;
});

/** 모델이 예전 프롬프트처럼 영문 코드를 섞어 넣은 경우 표시용으로만 제거 */
function sanitizeNewsletterCopy(text) {
  if (typeof text !== 'string') return text;
  const codes = Object.keys(SIGNAL_LABELS);
  let s = text;
  for (const code of codes) {
    s = s.replaceAll(`'${code}'`, '');
    s = s.replaceAll(`"${code}"`, '');
    s = s.replaceAll(`\`${code}\``, '');
    s = s.replace(new RegExp(`\\b${code}\\b`, 'g'), '');
  }
  return s
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s*[,.:]\s*/g, '')
    .trim();
}

function cardMeta(cardType) {
  if (cardType === 'support') {
    return { label: '지원 정보', icon: Landmark, color: 'bg-blue-100 text-blue-600' };
  }
  if (cardType === 'income') {
    return { label: '수익 아이디어', icon: TrendingUp, color: 'bg-teal-100 text-teal-600' };
  }
  return { label: '절약 팁', icon: Wallet, color: 'bg-pink-100 text-pink-600' };
}

async function onGenerate() {
  isGenerating.value = true;
  errorMessage.value = '';
  try {
    const payload = {
      totalExpense: currentMonthExpense.value,
      topCategories: topCategories.value,
      signals: spendingSignals.value,
      budget: profileStore.profile?.monthlyBudget || 0,
    };
    const result = await generateNewsletter(payload, 4);
    generatedCards.value = Array.isArray(result.cards) ? result.cards : [];
    generatedAt.value = result.generatedAt || new Date().toISOString();
    persistNewsletter();
  } catch (_error) {
    errorMessage.value = '소식지 생성에 실패했습니다. 잠시 후 다시 시도하세요.';
  } finally {
    isGenerating.value = false;
  }
}

watch(
  () => auth.currentUserId,
  () => {
    loadPersistedNewsletter();
  }
);

onMounted(async () => {
  auth.hydrate();
  await Promise.all([budgetStore.fetchAll(), categoryStore.fetchAll(), profileStore.fetchAll()]);
  loadPersistedNewsletter();
});
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-foreground">AI 맞춤 소식지 📰</h1>
      <p class="text-muted-foreground">
        당신의 소비 패턴과 실시간 검색 정보를 결합한 맞춤형 카드뉴스를 확인하세요
      </p>
    </div>

    <UiCard
      class="border-none bg-gradient-to-r from-primary/10 via-amber-50 to-primary/5 shadow-sm backdrop-blur-sm"
    >
      <div class="flex items-start gap-4 p-6">
        <div class="rounded-full bg-primary/20 p-3">
          <Sparkles class="h-6 w-6 text-primary" />
        </div>
        <div class="flex-1">
          <h3 class="font-semibold text-foreground">AI 분석 리포트</h3>
          <p class="mt-1 text-sm text-muted-foreground">{{ overviewText }}</p>
          <p class="mt-1 text-xs text-primary/80">
            실시간 검색 기반으로 최신 혜택/지원 정보를 반영합니다.
          </p>
          <p class="mt-1 text-xs text-muted-foreground">
            이번 달 지출: <span class="font-semibold">{{ formatWon(currentMonthExpense) }}</span>
            <span v-if="profileStore.profile?.monthlyBudget">
              / 예산 {{ formatWon(profileStore.profile.monthlyBudget) }}
            </span>
          </p>
        </div>
        <UiButton :disabled="isGenerating || budgetStore.loading" @click="onGenerate">
          {{ isGenerating ? '생성 중...' : 'AI 소식지 생성' }}
        </UiButton>
      </div>
      <div v-if="errorMessage" class="px-6 pb-6 text-sm text-red-500">
        {{ errorMessage }}
      </div>
      <div v-if="generatedAt" class="px-6 pb-6 text-xs text-muted-foreground">
        마지막 생성: {{ new Date(generatedAt).toLocaleString('ko-KR') }}
      </div>
    </UiCard>

    <UiCard
      v-if="budgetStore.loading"
      class="border-none bg-card/80 p-6 shadow-sm backdrop-blur-sm"
    >
      <p class="text-sm text-muted-foreground">소비 데이터를 불러오는 중입니다...</p>
    </UiCard>

    <div v-else class="grid gap-4 md:grid-cols-4">
      <UiCard
        v-for="insight in weeklyInsights"
        :key="insight.label"
        :class="
          cn(
            'border-none shadow-sm backdrop-blur-sm',
            insight.trend === 'down' ? 'bg-green-50/80' : 'bg-pink-50/80'
          )
        "
      >
        <div class="p-4 py-4">
          <p class="text-sm text-muted-foreground">{{ insight.label }}</p>
          <p
            :class="
              cn('text-xl font-bold', insight.trend === 'down' ? 'text-green-600' : 'text-pink-600')
            "
          >
            {{ insight.change > 0 ? '+' : '' }}{{ insight.change }}%
          </p>
          <p class="text-xs text-muted-foreground">전주 대비</p>
        </div>
      </UiCard>
    </div>

    <UiCard
      v-if="!isGenerating && generatedCards.length === 0"
      class="border-none bg-card/80 p-6 text-sm text-muted-foreground shadow-sm backdrop-blur-sm"
    >
      아직 생성된 소식지가 없습니다.
      <span class="font-semibold text-foreground">AI 소식지 생성</span>
      버튼을 눌러 시작해보세요.
    </UiCard>

    <div v-if="generatedCards.length > 0" class="grid gap-6 md:grid-cols-2">
      <UiCard
        v-for="(card, index) in generatedCards"
        :key="`${card.title}-${index}`"
        class="group relative border-none bg-card/80 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg"
      >
        <div class="pointer-events-none absolute inset-0 rounded-xl bg-primary/[0.02]" />

        <div class="p-6 pb-2">
          <div class="flex items-center gap-3">
            <div :class="cn('rounded-xl p-2', cardMeta(card.cardType).color)">
              <component :is="cardMeta(card.cardType).icon" class="h-5 w-5" />
            </div>
            <span
              class="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {{ cardMeta(card.cardType).label }}
            </span>
          </div>
        </div>

        <div class="space-y-3 px-6 pb-6">
          <h3 class="text-lg font-semibold text-foreground group-hover:text-primary">
            {{ card.title }}
          </h3>
          <p class="text-sm text-muted-foreground">{{ sanitizeNewsletterCopy(card.summary) }}</p>
          <p class="rounded-lg bg-muted/50 p-3 text-sm text-foreground">
            <span class="font-medium">이유:</span> {{ sanitizeNewsletterCopy(card.reason) }}
          </p>
          <p class="rounded-lg bg-primary/10 p-3 text-sm text-foreground">
            <span class="font-medium">실행 팁:</span> {{ sanitizeNewsletterCopy(card.actionTip) }}
          </p>
          <div class="flex flex-wrap gap-2">
            <span v-for="tag in card.tags || []" :key="tag" class="text-xs text-primary/80">
              {{ tag }}
            </span>
          </div>
          <a
            v-if="card.sourceUrl"
            :href="card.sourceUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-2 flex items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
          >
            출처: {{ card.sourceTitle || '바로가기' }}
            <ExternalLink class="h-3 w-3" />
          </a>
        </div>
      </UiCard>
    </div>

    <UiCard class="border-none bg-card/80 shadow-sm backdrop-blur-sm">
      <div class="p-6 pb-2">
        <h2 class="flex items-center gap-2 text-lg font-semibold">
          <span class="text-xl">💡</span>
          이번 주 소비 신호
        </h2>
        <p class="mt-1 text-xs text-muted-foreground">
          아래는 이번 주 거래를 기준으로 잡은 패턴이에요. AI 카드 문장과는 별개로, 참고용
          요약입니다.
        </p>
      </div>
      <div class="space-y-3 px-6 pb-6 text-sm">
        <div
          v-for="item in signalDisplayList"
          :key="item.key"
          class="rounded-lg border border-border/60 bg-primary/5 p-3"
        >
          <p class="font-medium text-foreground">{{ item.title }}</p>
          <p class="mt-1 text-xs leading-relaxed text-muted-foreground">{{ item.detail }}</p>
        </div>
      </div>
    </UiCard>
  </div>
</template>

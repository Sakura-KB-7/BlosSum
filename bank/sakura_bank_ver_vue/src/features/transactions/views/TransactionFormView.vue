<script setup>
import { computed, onMounted, ref, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import UiCard from '@/shared/ui/UiCard.vue';
import UiButton from '@/shared/ui/UiButton.vue';
import { useBudgetStore } from '@/features/transactions/stores/budget';
import { useCategoryStore } from '@/features/transactions/stores/categories';

const route = useRoute();
const router = useRouter();
const budget = useBudgetStore();
const categories = useCategoryStore();

const isEdit = computed(() => typeof route.params.id === 'string' && route.params.id.length > 0);

const date = ref('');
const type = ref('expense');
const categoryId = ref('');
const title = ref('');
const amount = ref(null);
const paymentMethod = ref('card');
const memo = ref('');
const isFixed = ref(false);
const recurringDay = ref(null);
const saving = ref(false);

const categoryList = computed(() =>
  type.value === 'income' ? categories.income : categories.expense
);

function applyTypeFromQuery() {
  if (isEdit.value) return;
  const qType = route.query.type;
  if (qType === 'income' || qType === 'expense') {
    type.value = qType;
    categoryId.value = '';
  }
}

function applyDateFromQuery() {
  if (isEdit.value) return;
  const qDate = route.query.date;
  if (typeof qDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(qDate)) {
    date.value = qDate;
  }
}

async function loadFromRow() {
  const id = route.params.id;
  const row = budget.items.find((x) => String(x.id) === id);
  if (!row) return;
  date.value = row.date;
  type.value = row.type;
  title.value = row.title;
  amount.value = row.amount;
  paymentMethod.value = row.paymentMethod;
  memo.value = row.memo;
  isFixed.value = row.isFixed;
  recurringDay.value = row.recurringDay ?? null;

  // 카테고리 목록 그려진 후 id 할당
  await nextTick();
  categoryId.value = row.categoryId;
}

onMounted(async () => {
  await Promise.all([budget.fetchAll(), categories.fetchAll()]);
  if (isEdit.value) loadFromRow();
  else {
    applyTypeFromQuery();
    applyDateFromQuery();
    if (!date.value) date.value = new Date().toISOString().slice(0, 10);
  }
});

watch(
  () => route.params.id,
  () => {
    if (isEdit.value) loadFromRow();
  }
);

watch(
  () => route.query.type,
  () => {
    applyTypeFromQuery();
  }
);

watch(
  () => route.query.date,
  () => {
    applyDateFromQuery();
  }
);

// 수정 시 카테고리 초기화되지 않도록
watch(type, (newType, oldType) => {
  if (oldType) {
    categoryId.value = '';
  }
});

function parseCategoryId() {
  const v = categoryId.value;
  if (v === '' || v === null || v === undefined) return NaN;
  return typeof v === 'number' ? v : Number(v);
}

function buildPayload() {
  const base = {
    type: type.value,
    date: date.value,
    categoryId: parseCategoryId(),
    title: title.value.trim(),
    amount: Number(amount.value),
    paymentMethod: paymentMethod.value,
    memo: memo.value || '',
    isFixed: isFixed.value,
  };
  if (isFixed.value && recurringDay.value != null && !Number.isNaN(recurringDay.value)) {
    base.recurringDay = recurringDay.value;
  }
  return base;
}

async function onSubmit() {
  if (!date.value || amount.value == null || Number.isNaN(amount.value)) {
    alert('날짜와 금액을 입력해 주세요.');
    return;
  }
  if (categoryId.value === '' || Number.isNaN(parseCategoryId())) {
    alert('카테고리를 선택해 주세요.');
    return;
  }
  if (!title.value.trim()) {
    alert('제목을 입력해 주세요.');
    return;
  }
  saving.value = true;
  try {
    const payload = buildPayload();
    if (isEdit.value) {
      await budget.updateRow(route.params.id, payload);
    } else {
      await budget.createRow(payload);
    }
    router.push({ name: 'transactions' });
  } finally {
    saving.value = false;
  }
}

function onCancel() {
  router.back();
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-foreground">
        {{ isEdit ? '거래 수정' : '거래 등록' }}
      </h1>
      <p class="text-muted-foreground">
        날짜·금액·카테고리·제목을 입력하고 저장하세요.
      </p>
    </div>

    <UiCard class="max-w-lg border-none bg-card/80 shadow-sm backdrop-blur-sm">
      <form class="flex flex-col gap-4 p-6" @submit.prevent="onSubmit">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-foreground" for="d">날짜</label>
          <input
            id="d"
            v-model="date"
            type="date"
            required
            class="rounded-lg border border-input bg-background px-3 py-2"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-foreground" for="t">구분</label>
          <select
            id="t"
            v-model="type"
            class="rounded-lg border border-input bg-background px-3 py-2"
          >
            <option value="expense">지출</option>
            <option value="income">수입</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-foreground" for="c">카테고리</label>
          <select
            id="c"
            v-model="categoryId"
            required
            class="rounded-lg border border-input bg-background px-3 py-2"
          >
            <option disabled value="">선택</option>
            <option v-for="opt in categoryList" :key="opt.id" :value="opt.id">
              {{ opt.name }}
            </option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-foreground" for="ti">제목</label>
          <input
            id="ti"
            v-model="title"
            type="text"
            placeholder="예: 점심 식사"
            required
            class="rounded-lg border border-input bg-background px-3 py-2"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-foreground" for="pm">결제 수단</label>
          <select
            id="pm"
            v-model="paymentMethod"
            class="rounded-lg border border-input bg-background px-3 py-2"
          >
            <option value="card">카드</option>
            <option value="transfer">계좌이체</option>
            <option value="cash">현금</option>
            <option value="other">기타</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-foreground" for="a">금액</label>
          <input
            id="a"
            v-model.number="amount"
            type="number"
            min="0"
            step="1"
            required
            class="rounded-lg border border-input bg-background px-3 py-2"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-foreground" for="m">메모</label>
          <textarea
            id="m"
            v-model="memo"
            rows="3"
            placeholder="메모"
            class="rounded-lg border border-input bg-background px-3 py-2"
          />
        </div>
        <div class="flex items-center gap-2">
          <input id="fx" v-model="isFixed" type="checkbox" class="rounded border-input" />
          <label class="text-sm text-foreground" for="fx">고정 수입·지출</label>
        </div>
        <div v-if="isFixed" class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-foreground" for="rd">반복일 (매월)</label>
          <input
            id="rd"
            v-model.number="recurringDay"
            type="number"
            min="1"
            max="31"
            placeholder="1–31"
            class="rounded-lg border border-input bg-background px-3 py-2"
          />
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <UiButton type="button" variant="outline" @click="onCancel">취소</UiButton>
          <UiButton type="submit" :disabled="saving">
            {{ saving ? '저장 중…' : '저장' }}
          </UiButton>
        </div>
      </form>
    </UiCard>
  </div>
</template>

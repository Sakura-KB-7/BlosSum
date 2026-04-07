<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import UiCard from '@/components/ui/UiCard.vue';
import UiButton from '@/components/ui/UiButton.vue';
import { useBudgetStore } from '@/stores/budget';
import { useCategoryStore } from '@/stores/categories';
import type { BudgetType } from '@/types/models';

const route = useRoute();
const router = useRouter();
const budget = useBudgetStore();
const categories = useCategoryStore();

const isEdit = computed(() => typeof route.params.id === 'string' && route.params.id.length > 0);

const date = ref('');
const type = ref<BudgetType>('expense');
const category = ref('');
const detailCategory = ref('');
const amount = ref<number | null>(null);
const memo = ref('');
const saving = ref(false);

const categoryList = computed(() =>
  type.value === 'income' ? categories.income : categories.expense
);

function newId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadFromRow() {
  const id = route.params.id as string;
  const row = budget.items.find((x) => x.id === id);
  if (!row) return;
  date.value = row.date;
  type.value = row.type;
  category.value = row.category;
  detailCategory.value = row.detailCategory;
  amount.value = row.amount;
  memo.value = row.memo;
}

onMounted(async () => {
  await Promise.all([budget.fetchAll(), categories.fetchAll()]);
  if (isEdit.value) loadFromRow();
  else if (!date.value) date.value = new Date().toISOString().slice(0, 10);
});

watch(
  () => route.params.id,
  () => {
    if (isEdit.value) loadFromRow();
  }
);

watch(type, () => {
  category.value = '';
});

async function onSubmit() {
  if (!date.value || amount.value == null || Number.isNaN(amount.value)) {
    alert('날짜와 금액을 입력해 주세요.');
    return;
  }
  if (!category.value) {
    alert('카테고리를 선택해 주세요.');
    return;
  }
  saving.value = true;
  try {
    const payload = {
      date: date.value,
      type: type.value,
      category: category.value,
      detailCategory: detailCategory.value || '',
      amount: Number(amount.value),
      memo: memo.value || '',
    };
    if (isEdit.value) {
      await budget.updateRow(route.params.id as string, payload);
    } else {
      await budget.createRow({
        id: newId(),
        ...payload,
      });
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
      <h1 class="text-2xl font-bold text-foreground">{{ isEdit ? '거래 수정' : '거래 등록' }}</h1>
      <p class="text-muted-foreground">날짜·금액·카테고리·메모를 입력하고 저장하세요.</p>
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
            v-model="category"
            required
            class="rounded-lg border border-input bg-background px-3 py-2"
          >
            <option disabled value="">선택</option>
            <option v-for="opt in categoryList" :key="opt.id" :value="opt.name">
              {{ opt.name }}
            </option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-foreground" for="dc">세부 카테고리 (선택)</label>
          <input
            id="dc"
            v-model="detailCategory"
            type="text"
            placeholder="예: 커피"
            class="rounded-lg border border-input bg-background px-3 py-2"
          />
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

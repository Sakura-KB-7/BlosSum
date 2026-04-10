<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import UiButton from '@/shared/ui/UiButton.vue';
import { useBudgetStore } from '@/features/transactions/stores/budget';
import { useCategoryStore } from '@/features/transactions/stores/categories';

/*
[Props]
- initialData: 영수증 스캔을 통해 추출된 [상호명, 날짜, 금액] 객체 
*/
const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({}),
  },
});

/*
[Emits]
- success: 저장 성공 시 부모에게 알림
- cancel: 취소 버튼 클릭 시 폼 닫기 요청
*/
const emit = defineEmits(['success', 'cancel', 'notify']);

// 스토어 연결
const budget = useBudgetStore();
const categories = useCategoryStore();

/*
상태 관리
- TransactionFormView의 입력 폼 구조 유지
*/
const date = ref('');
const type = ref('expense');
const categoryId = ref('');
const title = ref('');
const amount = ref(null);
const paymentMethod = ref('card');
const memo = ref('영수증 스캔으로 등록됨');
const isFixed = ref(false);
const recurringDay = ref(null);
const saving = ref(false);

// 수입/지출 구분에 따른 카테고리 목록 필터링
const categoryList = computed(() =>
  type.value === 'income' ? categories.income : categories.expense,
);

/*
폼 초기 데이터 세팅 함수
*/
const initFormData = () => {
  if (props.initialData) {
    date.value =
      props.initialData.date || new Date().toISOString().slice(0, 10);
    title.value = props.initialData.store || '';
    amount.value = props.initialData.amount || null;

    // LLM이 추천한 ID가 카테고리 목록에 있는지 확인 후 할당
    if (props.initialData.categoryId) {
      const exists = categoryList.value.some(
        (c) => c.id === props.initialData.categoryId,
      );
      if (exists) {
        categoryId.value = props.initialData.categoryId;
      }
    }
  }
};

onMounted(async () => {
  // 스토어 데이터 로드
  await Promise.all([budget.fetchAll(), categories.fetchAll()]);
  initFormData();
});

/*
[Watch]
1. 구분이 바뀌면 선택된 카테고리 초기화
2. 스캔 데이터(props)가 변경되면 즉시 폼 업데이트
*/
watch(type, () => {
  categoryId.value = '';
});

watch(
  () => props.initialData,
  () => {
    initFormData();
  },
  { deep: true },
);

// 카테고리 ID -> 숫자로 변환
function parseCategoryId() {
  const v = categoryId.value;
  if (v === '' || v === null || v === undefined) return NaN;
  return typeof v === 'number' ? v : Number(v);
}

// 전송용 데이터
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
  if (isFixed.value && recurringDay.value != null) {
    base.recurringDay = recurringDay.value;
  }
  return base;
}

/*
[Submit]
- 가계부 내역 생성
*/
async function onSubmit() {
  // 유효성 검사
  if (!date.value || amount.value == null) {
    emit('notify', {
      title: '입력값을 확인해 주세요',
      description: '날짜와 금액을 입력해야 저장할 수 있습니다.',
    });
    return;
  }
  if (!categoryId.value) {
    emit('notify', {
      title: '카테고리를 선택해 주세요',
      description: '지출 또는 수입에 맞는 카테고리를 먼저 골라 주세요.',
    });
    return;
  }
  if (!title.value.trim()) {
    emit('notify', {
      title: '제목을 입력해 주세요',
      description: '거래 내역을 구분할 수 있는 제목이 필요합니다.',
    });
    return;
  }

  saving.value = true;
  try {
    const payload = buildPayload();
    await budget.createRow(payload);
    emit('success'); // 부모 컴포넌트에 알림
  } catch (error) {
    console.error('Save Error:', error);
    emit('notify', {
      title: '저장에 실패했습니다',
      description: '잠시 후 다시 시도해 주세요.',
    });
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="w-full">
    <form class="flex flex-col gap-4 p-6 pt-2" @submit.prevent="onSubmit">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-foreground" for="d"
          >날짜</label
        >
        <input
          id="d"
          v-model="date"
          type="date"
          required
          class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-foreground" for="t"
          >구분</label
        >
        <select
          id="t"
          v-model="type"
          class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="expense">지출</option>
          <option value="income">수입</option>
        </select>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-foreground" for="c"
          >카테고리</label
        >
        <select
          id="c"
          v-model="categoryId"
          required
          class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option disabled value="">카테고리를 선택해 주세요</option>
          <option v-for="opt in categoryList" :key="opt.id" :value="opt.id">
            {{ opt.name }}
          </option>
        </select>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-foreground" for="ti"
          >제목</label
        >
        <input
          id="ti"
          v-model="title"
          type="text"
          placeholder="예: 점심 식사"
          required
          class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-foreground" for="pm"
          >결제 수단</label
        >
        <select
          id="pm"
          v-model="paymentMethod"
          class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="card">카드</option>
          <option value="transfer">계좌이체</option>
          <option value="cash">현금</option>
          <option value="other">기타</option>
        </select>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-foreground" for="a"
          >금액</label
        >
        <input
          id="a"
          v-model.number="amount"
          type="number"
          min="0"
          required
          class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-foreground" for="m"
          >메모</label
        >
        <textarea
          id="m"
          v-model="memo"
          rows="3"
          placeholder="메모를 입력하세요"
          class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div class="flex items-center gap-2 py-2">
        <input
          id="fx"
          v-model="isFixed"
          type="checkbox"
          class="rounded border-input h-4 w-4"
        />
        <label class="text-sm font-medium text-foreground" for="fx"
          >고정 수입·지출</label
        >
      </div>

      <div
        v-if="isFixed"
        class="flex flex-col gap-1 animate-in fade-in slide-in-from-top-1"
      >
        <label class="text-xs font-semibold text-foreground" for="rd"
          >반복일 (매월)</label
        >
        <input
          id="rd"
          v-model.number="recurringDay"
          type="number"
          min="1"
          max="31"
          placeholder="1–31"
          class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div class="flex gap-2 justify-end w-full pt-6 border-t border-border/50">
        <button
          type="button"
          @click="$emit('cancel')"
          class="w-32 py-2 border border-slate-200 bg-slate-100 text-slate-700 rounded-full text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          취소
        </button>

        <button
          type="submit"
          class="w-32 py-2 bg-[#ff8faa] text-white rounded-full text-sm font-medium hover:bg-[#ff7a9d] transition-colors shadow-sm"
        >
          저장
        </button>
      </div>
    </form>
  </div>
</template>

<template>
  <div class="space-y-6">
    <!-- 상단 페이지 제목 -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-foreground flex items-center gap-2">
        영수증 스캔 등록 🧾
      </h1>
    </div>

    <!--
    레이아웃 컨테이너
    - isStarted 여부에 따라 레이아웃 변경
    -> false : 영수증 업로드 영역만 가운데 정렬
    -> true : 좌우 2단 정렬 (업로드 영역 + 수정/입력 영역)
    -->
    <div
      :class="
        cn(
          'grid gap-8 items-start transition-all duration-500',
          isStarted ? 'grid-cols-1 lg:grid-cols-12' : 'max-w-3xl mx-auto grid-cols-1'
        )
      "
    >
      <!-- 영수증 업로드 영역 -->
      <!-- :class 상태에 따라 컬럼 비율 변경 -->
      <div :class="isStarted ? 'lg:col-span-5' : 'col-span-1'">
        <UiCard class="border-none bg-card/80 shadow-sm backdrop-blur-sm">
          <div class="flex items-center gap-2 p-6 pb-2">
            <ScanLine class="h-5 w-5 text-primary" />
            <h2 class="text-lg font-semibold text-foreground">이미지 업로드</h2>
          </div>
          <div class="p-6">
            <!--
            업로드 컴포넌트 사용
            - 자식 컴포넌트에서 emit한 이벤트 수신
            - props로 상태 전달
            -->
            <ReceiptUploader
              v-model:is-analyzing="isAnalyzing"
              @analyze="handleAnalyze"
              :is-loading="isAnalyzing"
            />
          </div>
        </UiCard>
      </div>

      <!--
      수정/입력 영역
      - 스캔 시작 후 생성
      - v-if 로 DOM 생성/삭제)
      -->
      <div v-if="isStarted" class="lg:col-span-7 transition-all">
        <!-- 분석 중 상태 -->
        <UiCard
          v-if="isAnalyzing"
          class="border-none bg-card/80 shadow-sm backdrop-blur-sm min-h-[500px] flex flex-col items-center justify-center"
        >
          <Loader2Icon class="h-10 w-10 text-primary animate-spin" />
          <div class="mt-4 text-center space-y-2">
            <p class="text-lg font-medium text-foreground animate-pulse">
              데이터를 추출하고 있습니다...
            </p>
            <p class="text-sm text-muted-foreground">잠시만 기다려주시면 입력 폼이 완성됩니다.</p>
          </div>
        </UiCard>

        <!-- 분석 완료 상태 -->
        <UiCard
          v-else-if="extractedResult"
          class="border-none bg-card/80 shadow-sm backdrop-blur-sm"
        >
          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between p-6 pb-2 border-b border-border/50 gap-2"
          >
            <div class="flex items-center gap-2">
              <CheckCircle2Icon class="h-5 w-5 text-primary" />
              <h2 class="text-lg font-semibold text-foreground">상세 정보 입력</h2>
            </div>

            <div
              class="flex items-center gap-2 bg-[#ff8faa]/5 px-3 py-1.5 rounded-full border border-[#ff8faa]/10"
            >
              <span class="text-[10px] font-bold text-[#ff7a9d] uppercase tracking-wider"
                >Notice</span
              >
              <p class="text-[11px] text-muted-foreground">
                실제 내용과 다를 수 있으니
                <span class="text-[#ff7a9d] font-medium">날짜, 금액, 카테고리</span>를 확인해
                주세요.
              </p>
            </div>
          </div>
          <div class="p-2">
            <InputFormView
              :initial-data="extractedResult"
              @success="handleSuccess"
              @notify="handleNotify"
              @cancel="handleCancel"
            />
          </div>
        </UiCard>
      </div>
    </div>

    <ReceiptAlertModal
      :open="alertState.open"
      :title="alertState.title"
      :description="alertState.description"
      :tone="alertState.tone"
      @close="closeAlert"
      @confirm="confirmAlert"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ScanLine, Loader2Icon, CheckCircle2Icon } from 'lucide-vue-next';
import ReceiptUploader from '@/components/receipt/ReceiptUploader.vue';
import ReceiptAlertModal from '@/components/receipt/ReceiptAlertModal.vue';
import InputFormView from '@/components/receipt/InputFormView.vue';
import { getRecommendedCategory } from '@/ocr/api/llm';
import UiCard from '@/shared/ui/UiCard.vue';
import { cn } from '@/shared/lib/utils';

import { useBudgetStore } from '@/features/transactions/stores/budget';
import { useCategoryStore } from '@/features/transactions/stores/categories';
import { useLoadingStore } from '@/stores/loading';

const router = useRouter();
const budget = useBudgetStore();
const categories = useCategoryStore();
const loadingStore = useLoadingStore();

// 상태 관리
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_VISION_API_KEY; // API 키
const isAnalyzing = ref(false); // 스캔 진행 상태
const extractedResult = ref(null); // OCR 결과 데이터
const isStarted = ref(false); // 스캔 시작 여부
const alertState = ref({
  open: false,
  title: '',
  description: '',
  tone: 'default',
  onConfirm: null,
});

// 초기 데이터 로딩
onMounted(async () => {
  await Promise.all([budget.fetchAll(), categories.fetchAll()]);
});

function openAlert({ title, description, tone = 'default', onConfirm = null }) {
  alertState.value = {
    open: true,
    title,
    description,
    tone,
    onConfirm,
  };
}

function closeAlert() {
  alertState.value = {
    open: false,
    title: '',
    description: '',
    tone: 'default',
    onConfirm: null,
  };
}

function confirmAlert() {
  const action = alertState.value.onConfirm;
  closeAlert();
  if (typeof action === 'function') action();
}

// 영수증 분석 로직
// 파일 업로드 후 실행되는 함수
const handleAnalyze = async (file) => {
  if (!file) return;
  if (!GOOGLE_API_KEY) {
    openAlert({
      title: 'Google Vision API 키가 없습니다',
      description: '`.env`에 `VITE_GOOGLE_VISION_API_KEY`를 설정해 주세요.',
    });
    return;
  }

  // 스캔 시작 시 상태 변경
  isStarted.value = true;
  isAnalyzing.value = true;
  extractedResult.value = null;
  loadingStore.showOverlay({
    context: 'receipt',
    title: '영수증을 스캔하고 있어요',
    description: '텍스트와 금액 정보를 추출하는 중입니다.',
  });

  try {
    // [1] Google Vision OCR 실행
    const base64Image = await convertFileToBase64(file);
    const pureBase64 = base64Image.split(',')[1];

    const ocrResponse = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`,
      {
        requests: [
          {
            image: { content: pureBase64 },
            features: [{ type: 'TEXT_DETECTION' }],
          },
        ],
      }
    );

    const fullText = ocrResponse.data.responses[0]?.fullTextAnnotation?.text || '';

    if (fullText) {
      // [2] 정규식 기반 파싱 (날짜, 금액)
      const basicInfo = processParsedData(fullText);

      // [3] gpt 추천 카테고리 받아옴
      // - 현재 지출 카테고리 목록 보냄
      const recommendedId = await getRecommendedCategory(fullText, categories.expense);

      // [4] 결과 데이터 합치기
      extractedResult.value = {
        ...basicInfo,
        categoryId: recommendedId, // 자동 선택된 ID 주입
      };
    }
  } catch (error) {
    console.error(error);
    openAlert({
      title: '분석 중 오류가 발생했습니다',
      description: '이미지를 다시 업로드하거나 잠시 후 다시 시도해 주세요.',
    });
  } finally {
    isAnalyzing.value = false;
    loadingStore.hideOverlay();
  }
};

// OCR 텍스트 데이터 가공
const processParsedData = (text) => {
  // console.log('추출된 전체 텍스트 : ', text);

  // [날짜 추출]
  // - 다양한 날짜 패턴 찾기
  const dateRegex = /(?:\b|[^0-9])(\d{2,4})[-./](\d{1,2})[-./](\d{1,2})(?:\b|[^0-9])/;
  const dateMatch = text.match(dateRegex);

  let formattedDate = '';

  if (dateMatch) {
    let year = dateMatch[1];
    const month = dateMatch[2].padStart(2, '0');
    const day = dateMatch[3].padStart(2, '0');

    // 연도 2자리인 경우 처리 (25 -> 2025)
    if (year.length === 2) {
      year = '20' + year;
    }

    formattedDate = `${year}-${month}-${day}`;
  } else {
    // 날짜 패턴 찾지 못한 경우 오늘 날짜로 설정
    formattedDate = new Date().toISOString().split('T')[0];
  }

  // [금액 추출]
  const lines = text.split('\n');
  const amountCandidates = [];

  /*
  정규식 패턴
  - wonRegex : '원' 단위 붙은 숫자
  - strongKeywords : 최종 결제 금액 키워드
  - ignoreKeywords : 제외 키워드
  */
  const wonRegex = /([\d,.]+)\s*원/;
  const strongKeywords = /(?:합계|결제금액|받을금액|총금액|승인금액|판매\s*합계|카드\/간편결제)/;
  const ignoreKeywords = /(?:번호|NO|사업자|전화|TEL|일시|단가)/i;

  lines.forEach((line) => {
    if (ignoreKeywords.test(line)) return;

    // 1) 키워드와 숫자가 한 줄에 있는 경우 (예: '승인금액 30,000')
    const hasKeyword = strongKeywords.test(line);
    if (hasKeyword) {
      const numMatch = line.match(/([\d,.]+)/g);
      if (numMatch) {
        const cleaned = numMatch[numMatch.length - 1].replace(/[,.]/g, '');
        const num = parseInt(cleaned, 10);
        if (num > 0 && cleaned.length < 8) amountCandidates.push(num);
      }
    }

    // 2) '원' 단위 붙은 경우
    const wonMatch = line.match(wonRegex);
    if (wonMatch) {
      const cleaned = wonMatch[1].replace(/[,.]/g, '');
      const num = parseInt(cleaned, 10);
      if (num > 0 && cleaned.length < 8) amountCandidates.push(num);
    }
  });

  // [최종 결정]
  let finalAmount = null;
  if (amountCandidates.length > 0) {
    // 키워드 포함 후보 중 가장 마지막 금액 선택
    finalAmount = amountCandidates[amountCandidates.length - 1];
  } else {
    // 키워드 못찾은 경우: 텍스트 전체에서 가장 큰 숫자 (8자리 미만)
    const allNumbers = text.match(/[\d,.]+/g) || [];
    const nums = allNumbers
      .map((n) => n.replace(/[,.]/g, ''))
      .filter((n) => n.length > 2 && n.length < 8)
      .map((n) => parseInt(n, 10));
    if (nums.length > 0) finalAmount = Math.max(...nums);
  }

  return {
    store: '',
    date: formattedDate,
    amount: finalAmount,
  };
};

// 저장 성공
const handleSuccess = () => {
  openAlert({
    title: '성공적으로 저장되었습니다!',
    description: '거래 내역 화면으로 이동해 저장된 영수증을 확인할 수 있습니다.',
    tone: 'success',
    onConfirm: () => router.push({ name: 'transactions' }),
  });
};

function handleNotify(payload) {
  openAlert(payload);
}

// 취소 버튼 클릭
const handleCancel = () => {
  extractedResult.value = null;
  isStarted.value = false;
};

// 이미지 파일 형식 변환 (Base64) - OCR API 전송 위해
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};
</script>

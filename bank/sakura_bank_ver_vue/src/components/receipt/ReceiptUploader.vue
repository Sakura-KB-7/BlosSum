<template>
  <UiCard
    class="p-6 border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 transition-colors"
  >
    <div class="flex flex-col items-center justify-center space-y-4">
      <template v-if="!previewUrl">
        <div
          class="flex flex-col items-center justify-center cursor-pointer w-full py-10"
          @click="$refs.fileInput.click()"
        >
          <div class="bg-primary/10 p-4 rounded-full mb-4">
            <CameraIcon class="h-8 w-8 text-primary" />
          </div>
          <p class="text-sm font-medium text-foreground">
            영수증 사진을 업로드하거나 촬영하세요
          </p>
          <p class="text-xs text-muted-foreground mt-1">PNG, JPG (최대 5MB)</p>
        </div>
      </template>

      <template v-else>
        <div class="relative w-full group">
          <img
            :src="previewUrl"
            alt="영수증 미리보기"
            class="max-h-80 w-full object-contain rounded-lg shadow-md"
          />

          <button
            @click="resetImage"
            class="absolute top-2 right-2 bg-destructive text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <XIcon class="h-4 w-4" />
          </button>
        </div>

        <div class="flex gap-2 w-full">
          <button
            @click="$refs.fileInput.click()"
            class="flex-1 px-4 py-2 border border-slate-200 bg-slate-100 text-slate-700 rounded-full text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            다시 선택
          </button>

          <button
            @click="handleAnalyze"
            :disabled="isAnalyzing"
            class="flex-1 px-4 py-2 bg-[#ff8faa] text-white rounded-full text-sm font-medium hover:bg-[#ff7a9d] disabled:opacity-50 transition-colors shadow-sm"
          >
            {{ isAnalyzing ? '분석 중...' : '영수증 스캔 시작' }}
          </button>
        </div>
      </template>

      <input
        type="file"
        ref="fileInput"
        class="hidden"
        accept="image/*"
        @change="onFileChange"
      />
    </div>
  </UiCard>
</template>

<script setup>
import { ref } from 'vue';
import { CameraIcon, XIcon, Loader2Icon } from 'lucide-vue-next';
import UiCard from '@/shared/ui/UiCard.vue';

const emit = defineEmits(['analyze']);

const fileInput = ref(null);
const imageFile = ref(null);
const previewUrl = ref(null);
const isAnalyzing = ref(false);

// 파일 선택 시 실행
const onFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  imageFile.value = file;

  // 브라우저 메모리에 임시 URL 생성해 미리보기 구현
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = URL.createObjectURL(file);
};

// 초기화 함수
const resetImage = () => {
  imageFile.value = null;
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = null;
  if (fileInput.value) fileInput.value.value = '';
};

// 분석 버튼 클릭 -> 상위 컴포넌트로 파일 전달
const handleAnalyze = () => {
  isAnalyzing.value = true;
  emit('analyze', imageFile.value);
};
</script>

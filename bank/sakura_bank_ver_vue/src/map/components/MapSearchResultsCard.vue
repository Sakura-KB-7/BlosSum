<script setup>
import UiButton from '@/shared/ui/UiButton.vue';
import UiCard from '@/shared/ui/UiCard.vue';

defineProps({
  loadingMap: {
    type: Boolean,
    default: false,
  },
  searchResults: {
    type: Array,
    default: () => [],
  },
  savingPlaceId: {
    type: [String, Number, null],
    default: null,
  },
});

const emit = defineEmits(['focus-result', 'save-place']);
</script>

<template>
  <UiCard class="h-[280px] border-none bg-card/80 shadow-sm backdrop-blur-sm">
    <div class="p-5 pb-2">
      <h2 class="text-lg font-semibold">검색 결과</h2>
    </div>
    <div class="h-[208px] space-y-3 overflow-y-auto px-5 pb-5">
      <!-- 지도 SDK가 아직 안 뜬 경우 검색 결과 대신 준비 상태를 보여준다. -->
      <div
        v-if="loadingMap"
        class="rounded-2xl bg-secondary/60 px-4 py-6 text-center text-sm text-muted-foreground"
      >
        지도를 준비하는 중입니다...
      </div>
      <div
        v-else-if="searchResults.length === 0"
        class="rounded-2xl bg-secondary/60 px-4 py-6 text-center text-sm text-muted-foreground"
      >
        검색 결과가 여기에 표시됩니다.
      </div>
      <div
        v-for="place in searchResults"
        :key="place.id"
        class="rounded-2xl border border-border bg-background/80 p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <!-- 카드 본문 클릭은 저장이 아니라 지도 이동만 수행한다. -->
          <button type="button" class="min-w-0 flex-1 text-left" @click="emit('focus-result', place)">
            <p class="font-semibold text-foreground">{{ place.placeName }}</p>
            <p class="mt-1 text-sm text-muted-foreground">
              {{ place.roadAddressName || place.addressName || '주소 정보 없음' }}
            </p>
          </button>
          <UiButton
            size="sm"
            class="rounded-full"
            :disabled="savingPlaceId === place.id"
            @click="emit('save-place', place)"
          >
            <!-- 저장 버튼은 곧바로 db 저장이 아니라 draft 편집 단계로 넘긴다. -->
            {{ savingPlaceId === place.id ? '저장 중...' : '핀 저장' }}
          </UiButton>
        </div>
      </div>
    </div>
  </UiCard>
</template>

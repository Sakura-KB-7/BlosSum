<script setup>
import { useTemplateRef } from 'vue';
import { Crosshair } from 'lucide-vue-next';
import UiCard from '@/shared/ui/UiCard.vue';

defineProps({
  mapError: {
    type: String,
    default: '',
  },
  locating: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['move-current-location']);
const mapContainer = useTemplateRef('mapContainer');

// 부모가 이 DOM을 받아 네이버 지도 인스턴스를 직접 마운트할 수 있게 노출한다.
defineExpose({
  mapContainer,
});
</script>

<template>
  <UiCard class="border-none bg-card/80 shadow-sm backdrop-blur-sm">
    <div class="overflow-hidden rounded-xl">
      <!-- API 키가 없거나 SDK 로딩이 실패하면 지도를 대신해 안내 문구를 보여준다. -->
      <div
        v-if="mapError"
        class="flex h-[520px] flex-col items-center justify-center gap-3 bg-secondary/40 px-6 text-center"
      >
        <span class="text-4xl">🧭</span>
        <p class="font-medium text-foreground">{{ mapError }}</p>
        <p class="text-sm text-muted-foreground">
          `.env.example`을 참고해서 client ID를 넣은 뒤 개발 서버를 다시 실행하면 됩니다.
        </p>
      </div>
      <div v-else class="relative">
        <!-- 실제 네이버 지도가 붙는 빈 컨테이너 -->
        <div ref="mapContainer" class="h-[520px] w-full bg-secondary/40" />
        <!-- 지도 위에 떠 있는 현재 위치 이동 버튼 -->
        <button
          type="button"
          class="absolute bottom-4 right-4 z-10 inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-white/90 text-foreground shadow-lg backdrop-blur transition hover:bg-white"
          @click="emit('move-current-location')"
        >
          <Crosshair v-if="!locating" class="h-5 w-5" />
          <span v-else class="text-xs font-semibold">...</span>
        </button>
      </div>
    </div>
  </UiCard>
</template>

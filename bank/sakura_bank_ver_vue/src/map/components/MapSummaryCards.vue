<script setup>
import MapSummaryCardsSkeleton from '@/map/components/MapSummaryCardsSkeleton.vue';
import UiCard from '@/shared/ui/UiCard.vue';

const categoryToneMap = {
  '맛집': {
    itemClass: 'bg-white/90 text-foreground',
    badgeClass: 'bg-rose-100/80 text-rose-700',
  },
  '카페': {
    itemClass: 'bg-white/90 text-foreground',
    badgeClass: 'bg-orange-100/80 text-orange-700',
  },
  '산책': {
    itemClass: 'bg-white/90 text-foreground',
    badgeClass: 'bg-emerald-100/80 text-emerald-700',
  },
  '쇼핑': {
    itemClass: 'bg-white/90 text-foreground',
    badgeClass: 'bg-sky-100/80 text-sky-700',
  },
  '데이트': {
    itemClass: 'bg-white/90 text-foreground',
    badgeClass: 'bg-pink-100/80 text-pink-700',
  },
  '기타': {
    itemClass: 'bg-white/90 text-foreground',
    badgeClass: 'bg-slate-200/80 text-slate-700',
  },
};

function getCategoryTone(category) {
  return categoryToneMap[category] || categoryToneMap['기타'];
}

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  totalPlaces: {
    type: Number,
    default: 0,
  },
  categoryCounts: {
    type: Array,
    default: () => [],
  },
  recentSavedPlaces: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['focus-place']);
</script>

<template>
  <MapSummaryCardsSkeleton v-if="loading" />
  <div v-else class="grid gap-4 md:grid-cols-2">
    <UiCard class="h-[220px] border-none bg-card/80 shadow-sm backdrop-blur-sm">
      <div class="flex h-full flex-col p-5">
        <!-- 현재 계정에 저장된 장소 수를 가장 단순한 숫자로 보여준다. -->
        <p class="text-sm text-muted-foreground">저장한 핀</p>
        <div class="mt-2 flex items-end justify-between gap-4">
          <p class="text-2xl font-bold tracking-tight text-foreground">{{ totalPlaces }}곳</p>
          <p class="text-xs text-muted-foreground">카테고리별 저장 현황</p>
        </div>
        <div v-if="categoryCounts.length" class="mt-4 h-[116px] rounded-2xl bg-secondary/50 p-2">
          <div class="grid h-full grid-cols-2 auto-rows-[2rem] content-start gap-1.5 overflow-y-auto pr-1">
            <div
              v-for="item in categoryCounts"
              :key="item.category"
              class="flex h-8 min-w-0 items-center justify-between rounded-xl px-3"
              :class="getCategoryTone(item.category).itemClass"
            >
              <span class="truncate text-xs font-medium">{{ item.category }}</span>
              <span
                class="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                :class="getCategoryTone(item.category).badgeClass"
              >
                {{ item.count }}
              </span>
            </div>
          </div>
        </div>
        <div
          v-else
          class="mt-4 flex flex-1 items-center rounded-2xl bg-secondary/70 px-4 py-4 text-sm text-muted-foreground"
        >
          아직 카테고리별로 정리된 저장 장소가 없습니다.
        </div>
      </div>
    </UiCard>
    <UiCard class="h-[220px] border-none bg-card/80 shadow-sm backdrop-blur-sm">
      <div class="flex h-full flex-col p-5">
        <!-- 최근 저장 장소는 자주 다시 들어가는 위치를 빠르게 찾는 용도다. -->
        <p class="text-sm text-muted-foreground">최근 저장 장소</p>
        <div class="mt-2 flex items-end justify-between gap-4">
          <p class="text-2xl font-bold tracking-tight text-foreground">
            {{ recentSavedPlaces.length ? `${recentSavedPlaces.length}곳` : '-' }}
          </p>
          <p class="text-xs text-muted-foreground">최근 저장 바로가기</p>
        </div>
        <div v-if="recentSavedPlaces.length" class="mt-4 flex-1 space-y-2 overflow-y-auto">
          <button
            v-for="place in recentSavedPlaces"
            :key="place.id"
            type="button"
            class="block w-full rounded-2xl bg-secondary/70 px-4 py-2.5 text-left transition hover:bg-secondary"
            @click="emit('focus-place', place)"
          >
            <p class="font-medium text-foreground">{{ place.placeName }}</p>
            <p class="mt-1 text-xs text-muted-foreground">{{ place.category || '기타' }}</p>
          </button>
        </div>
        <p v-else class="mt-4 flex-1 text-sm leading-7 text-foreground">아직 저장한 장소가 없습니다.</p>
      </div>
    </UiCard>
  </div>
</template>

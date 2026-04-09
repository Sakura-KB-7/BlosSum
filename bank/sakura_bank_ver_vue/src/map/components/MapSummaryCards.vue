<script setup>
import MapSummaryCardsSkeleton from '@/map/components/MapSummaryCardsSkeleton.vue';
import UiCard from '@/shared/ui/UiCard.vue';

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
        <div v-if="categoryCounts.length" class="mt-4 grid flex-1 auto-rows-fr gap-2 sm:grid-cols-2">
          <div
            v-for="item in categoryCounts"
            :key="item.category"
            class="flex items-center justify-between rounded-2xl bg-secondary/70 px-3 py-2.5"
          >
            <span class="text-sm font-medium text-foreground">{{ item.category }}</span>
            <span class="rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-foreground">
              {{ item.count }}
            </span>
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

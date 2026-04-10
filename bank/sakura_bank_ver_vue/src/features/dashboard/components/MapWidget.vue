<script setup>
import { MapPin, Navigation, ArrowRight } from 'lucide-vue-next';
import UiCard from '@/shared/ui/UiCard.vue';
import { cn } from '@/shared/lib/utils';
</script>

<template>
  <RouterLink to="/map" class="block h-full group">
    <UiCard
      :class="
        cn(
          // 반응형 높이 설정
          'h-auto min-h-[160px] md:h-48 flex flex-col relative overflow-hidden transition-all duration-300',
          'p-6 md:p-7 border-none shadow-lg group-hover:-translate-y-1 group-hover:shadow-xl',
          // 위젯 색상
          'bg-white !text-slate-800',
        )
      "
    >
      <Navigation
        class="absolute -right-4 -bottom-4 w-32 h-32 text-slate-50 rotate-12"
      />

      <div class="relative z-10 flex items-center justify-between flex-none">
        <div class="inline-flex p-3 bg-blue-50 rounded-2xl">
          <MapPin class="h-6 w-6 text-blue-500" />
        </div>

        <div
          class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full shadow-inner"
        >
          <Navigation
            class="h-3.5 w-3.5 text-blue-400 fill-blue-100 rotate-12"
          />
          <span class="text-[10px] font-bold text-blue-600 uppercase"
            >My Places</span
          >
        </div>
      </div>

      <div class="flex-1"></div>

      <div class="relative z-10 h-16 flex flex-col justify-end space-y-1">
        <h3 class="text-lg font-bold flex items-center gap-2 text-slate-900">
          나의 소비지도
          <ArrowRight
            class="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0 text-blue-500"
          />
        </h3>
        <p class="text-[13px] text-slate-500 leading-tight line-clamp-2">
          자주 방문하는 장소와<br />
          지역별 지출 분포를 지도로 한눈에 확인해보세요 📍
        </p>
      </div>
    </UiCard>
  </RouterLink>
</template>

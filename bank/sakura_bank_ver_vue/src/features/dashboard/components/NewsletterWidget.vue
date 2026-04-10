<script setup>
import { Newspaper, Zap, ArrowRight } from 'lucide-vue-next';
import UiCard from '@/shared/ui/UiCard.vue';
import { cn } from '@/shared/lib/utils';
</script>

<template>
  <RouterLink to="/newsletter" class="block h-full group">
    <UiCard
      :class="
        cn(
          // 반응형 높이 설정
          'h-auto min-h-[160px] md:h-48 flex flex-col relative overflow-hidden transition-all duration-300',
          'p-6 md:p-7 border-none shadow-lg group-hover:-translate-y-1 group-hover:shadow-xl',
          // 위젯 색상
          'bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] !text-white',
        )
      "
    >
      <Newspaper
        class="absolute -right-4 -top-4 w-28 h-28 text-white/5 rotate-12"
      />

      <div class="relative z-10 flex items-center justify-between flex-none">
        <div class="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
          <Newspaper class="h-6 w-6 text-white" />
        </div>
        <div
          class="flex items-center gap-1 px-2.5 py-1 bg-amber-400 rounded-full shadow-sm"
        >
          <Zap class="h-3 w-3 text-amber-900 fill-current" />
          <span class="text-[9px] font-black text-amber-900 uppercase"
            >AI UPDATE</span
          >
        </div>
      </div>

      <div class="flex-1"></div>

      <div class="relative z-10 h-16 flex flex-col justify-end space-y-1">
        <h3 class="text-lg font-bold flex items-center gap-2">
          AI 금융 소식지
          <ArrowRight
            class="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0"
          />
        </h3>
        <p
          class="text-[13px] opacity-90 leading-tight line-clamp-2 text-purple-50"
        >
          나만을 위한 맞춤형 금융 리포트 🌸<br />
          매주 업데이트되는 최신 인사이트를 확인하세요.
        </p>
      </div>
    </UiCard>
  </RouterLink>
</template>

<script setup>
import { Camera, Sparkles, ArrowRight } from 'lucide-vue-next';
import UiCard from '@/shared/ui/UiCard.vue';
import { cn } from '@/shared/lib/utils';
</script>

<template>
  <RouterLink to="/receipt" class="block h-full group">
    <UiCard
      :class="
        cn(
          // 반응형 높이 설정
          'h-auto min-h-[160px] md:h-48 flex flex-col relative overflow-hidden transition-all duration-300',
          'p-6 md:p-7 border-none shadow-lg group-hover:-translate-y-1 group-hover:shadow-xl',
          // 위젯 색상
          'bg-gradient-to-br from-[#ff8faa] to-[#ff7a9d] !text-white',
        )
      "
    >
      <div
        class="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"
      ></div>

      <div class="relative z-10 flex items-center justify-between flex-none">
        <div class="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
          <Camera class="h-6 w-6 text-white" />
        </div>
        <Sparkles class="h-5 w-5 text-white/70 animate-pulse" />
      </div>

      <div class="flex-1"></div>

      <div class="relative z-10 h-16 flex flex-col justify-end space-y-1">
        <h3 class="text-lg font-bold flex items-center gap-2">
          영수증 스캔하기
          <ArrowRight
            class="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0"
          />
        </h3>
        <p
          class="text-[13px] opacity-90 leading-tight line-clamp-2 text-pink-50"
        >
          흩어진 영수증을 모아보세요 🌸<br />
          AI가 내역부터 카테고리까지 깔끔하게 정리해 드려요.
        </p>
      </div>
    </UiCard>
  </RouterLink>
</template>

<script setup>
import { ref } from 'vue';
import { RouterView } from 'vue-router';
import { cn } from '@/shared/lib/utils';
import CherryBlossomBackground from '@/components/CherryBlossomBackground.vue';
import AppSidebar from '@/components/AppSidebar.vue';

const leather =
  "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20.5h18V22H22v18h-2V22H2v18H0V22h20v-1.5zM0 38v2h20v-2H0zm22 2h18v-2H22v2zM0 30v2h20v-2H0zm22 2h18v-2H22v2zM0 34v2h20v-2H0zm22 2h18v-2H22v2z' fill='%23000' fill-opacity='.1' fill-rule='evenodd'/%3E%3C/svg%3E\")";

const isIntroComplete = ref(false);
</script>

<template>
  <div
    v-if="!isIntroComplete"
    class="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-pink-50 via-amber-50 to-pink-100"
  >
    <CherryBlossomBackground />

    <div class="z-10 flex flex-col items-center">
      <div
        class="group relative cursor-pointer transition-all duration-500 hover:scale-105"
        role="button"
        tabindex="0"
        @click="isIntroComplete = true"
        @keydown.enter.prevent="isIntroComplete = true"
      >
        <div
          class="absolute -bottom-4 left-1/2 h-8 w-48 -translate-x-1/2 rounded-full bg-black/10 blur-xl transition-all group-hover:w-52"
        />

        <div class="relative">
          <div
            class="h-44 w-64 rounded-2xl bg-gradient-to-br from-amber-800 to-amber-950 shadow-2xl"
          >
            <div
              class="absolute inset-0 rounded-2xl opacity-30"
              :style="{ backgroundImage: leather }"
            />
            <div
              class="absolute left-1/2 top-2 h-6 w-16 -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 shadow-md"
            />
          </div>

          <div
            :class="
              cn(
                'absolute left-0 top-0 h-32 w-64 origin-top rounded-t-2xl bg-gradient-to-br from-amber-700 to-amber-900 shadow-lg transition-all duration-500',
                'group-hover:[transform:rotateX(-60deg)]'
              )
            "
            style="transform-style: preserve-3d; perspective: 1000px"
          >
            <div
              class="absolute inset-0 rounded-t-2xl opacity-30"
              :style="{ backgroundImage: leather }"
            />
            <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div
                class="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-amber-400 shadow-inner"
              >
                <span class="text-3xl">🌸</span>
              </div>
            </div>
          </div>

          <div
            class="absolute left-4 right-4 top-8 flex flex-col items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          >
            <div class="flex gap-2">
              <span v-for="(e, i) in ['💳', '💴', '🧧']" :key="i" class="text-2xl">{{ e }}</span>
            </div>
            <p class="mt-2 text-xs text-amber-100">지갑을 열어보세요!</p>
          </div>
        </div>
      </div>

      <div class="mt-12 text-center">
        <h1 class="text-4xl font-bold text-foreground">🌸 봄지갑</h1>
        <p class="mt-2 text-lg text-muted-foreground">Spring Wallet</p>
        <p class="mt-4 text-sm text-muted-foreground">지갑을 클릭하여 시작하세요</p>
      </div>

      <div
        class="absolute left-10 top-20 animate-bounce text-4xl opacity-60"
        style="animation-delay: 0.5s"
      >
        🌸
      </div>
      <div
        class="absolute right-20 top-32 animate-bounce text-3xl opacity-50"
        style="animation-delay: 1s"
      >
        🌸
      </div>
      <div
        class="absolute bottom-32 left-20 animate-bounce text-2xl opacity-40"
        style="animation-delay: 1.5s"
      >
        🌸
      </div>
    </div>
  </div>

  <div v-else class="relative flex min-h-screen bg-background">
    <CherryBlossomBackground />
    <AppSidebar />
    <main class="relative z-10 flex-1 overflow-auto p-6">
      <RouterView />
    </main>
  </div>
</template>

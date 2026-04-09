<script setup>
import { onMounted, ref, watch } from 'vue';
import { RouterView } from 'vue-router';
import { cn } from '@/shared/lib/utils';
import CherryBlossomBackground from '@/components/CherryBlossomBackground.vue';
import CherryBlossomCursorEffect from '@/components/CherryBlossomCursorEffect.vue';
import AppSidebar from '@/components/AppSidebar.vue';

const leather =
  "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20.5h18V22H22v18h-2V22H2v18H0V22h20v-1.5zM0 38v2h20v-2H0zm22 2h18v-2H22v2zM0 30v2h20v-2H0zm22 2h18v-2H22v2zM0 34v2h20v-2H0zm22 2h18v-2H22v2z' fill='%23000' fill-opacity='.1' fill-rule='evenodd'/%3E%3C/svg%3E\")";

const isIntroComplete = ref(false);

const INTRO_STORAGE_KEY = 'spring-wallet-intro-complete';

onMounted(() => {
  if (typeof window === 'undefined') return;
  isIntroComplete.value = window.localStorage.getItem(INTRO_STORAGE_KEY) === 'true';
});

watch(isIntroComplete, (value) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(INTRO_STORAGE_KEY, value ? 'true' : 'false');
});

function triggerSakuraBurst() {
  window.dispatchEvent(new CustomEvent('sakura:burst', { detail: { count: 16 } }));
}
</script>

<template>
  <div class="relative flex min-h-screen bg-background">
    <CherryBlossomBackground />
    <CherryBlossomCursorEffect />
    <AppSidebar />
    <main class="relative z-10 flex-1 overflow-auto p-6">
      <RouterView />
    </main>
    <button
      type="button"
      class="fixed bottom-6 right-6 z-30 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg transition hover:scale-105 hover:bg-primary/90"
      @click="triggerSakuraBurst"
    >
      🌸 벚꽃 뿌리기 (B)
    </button>
  </div>
</template>

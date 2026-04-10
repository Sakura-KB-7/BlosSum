<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LoadingStage from '@/loading/components/LoadingStage.vue';

const route = useRoute();
const router = useRouter();

const redirectName = computed(() => {
  const raw = route.query.redirect;
  return typeof raw === 'string' && raw.trim() ? raw.trim() : 'dashboard';
});

function onComplete() {
  router.replace({ name: redirectName.value });
}
</script>

<template>
  <div
    class="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(255,245,247,0.95)_30%,_rgba(255,233,240,0.92)_65%,_rgba(255,225,236,0.96)_100%)] px-6"
  >
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute -left-16 top-16 h-72 w-72 rounded-full bg-pink-200/35 blur-3xl" />
      <div class="absolute right-4 top-2 h-80 w-80 rounded-full bg-rose-200/30 blur-3xl" />
      <div
        class="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-100/45 blur-3xl"
      />
    </div>

    <div
      class="relative z-10 w-full max-w-md rounded-3xl border border-white/50 bg-white/85 p-6 shadow-[0_25px_80px_rgba(190,114,146,0.22)]"
    >
      <LoadingStage
        :duration="1800"
        title="로그인 성공!"
        description="대시보드로 이동하는 중입니다."
        @complete="onComplete"
      />
    </div>
  </div>
</template>

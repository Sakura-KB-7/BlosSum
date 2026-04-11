<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
});

const todayLabel = computed(() =>
  new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date())
);
</script>

<template>
  <div
    class="rounded-2xl border border-white/60 bg-gradient-to-r from-rose-50/90 via-pink-50/75 to-amber-50/90 p-5 shadow-sm backdrop-blur-sm"
  >
    <p class="text-xs font-semibold tracking-wide text-primary/80">
      환영합니다, 오늘도 좋은 하루예요 🌸
    </p>
    <p class="mt-1 text-xs text-muted-foreground">{{ todayLabel }}</p>
    <h1 class="mt-3 text-2xl font-bold tracking-tight text-foreground">{{ title }}</h1>
    <p v-if="description" class="mt-1 text-sm text-muted-foreground">{{ description }}</p>
  </div>
</template>

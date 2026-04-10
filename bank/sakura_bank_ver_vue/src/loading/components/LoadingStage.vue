<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import PetalCanvas from '@/loading/components/PetalCanvas.vue';
import { pickRandomLoadingVariant } from '@/loading/constants';

const props = defineProps({
  duration: {
    type: Number,
    default: 1500,
  },
  variant: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '로딩 중입니다',
  },
  description: {
    type: String,
    default: '잠시만 기다려 주세요.',
  },
});

const emit = defineEmits(['complete']);

const progress = ref(0);
const animationVariant = ref(props.variant || pickRandomLoadingVariant());
let startAt = 0;
let rafId = 0;
let completed = false;

const percentLabel = computed(() => `${Math.round(progress.value)}%`);

function complete() {
  if (completed) return;
  completed = true;
  progress.value = 100;
  emit('complete');
}

function tick(now) {
  if (!startAt) startAt = now;
  const elapsed = now - startAt;
  const ratio = Math.min(elapsed / props.duration, 1);
  progress.value = ratio * 100;
  if (ratio >= 1) {
    complete();
    return;
  }
  rafId = requestAnimationFrame(tick);
}

onMounted(() => {
  progress.value = 0;
  completed = false;
  startAt = 0;
  rafId = requestAnimationFrame(tick);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId);
});
</script>

<template>
  <div class="flex w-full max-w-sm flex-col items-center gap-4">
    <div class="h-52 w-52">
      <PetalCanvas :variant="animationVariant" :width="220" :height="220" />
    </div>

    <div class="text-center">
      <p class="text-lg font-semibold text-foreground">{{ title }}</p>
      <p class="mt-1 text-sm text-muted-foreground">{{ description }}</p>
    </div>

    <div class="w-full">
      <div class="h-2 w-full overflow-hidden rounded-full bg-primary/20">
        <div
          class="h-full rounded-full bg-gradient-to-r from-pink-300 via-pink-400 to-rose-400 transition-[width] duration-75"
          :style="{ width: `${progress}%` }"
        />
      </div>
      <p class="mt-2 text-center text-xs font-semibold text-primary/80">
        {{ percentLabel }}
      </p>
    </div>
  </div>
</template>

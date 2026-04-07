<script setup>
import { computed } from 'vue';
import { formatAmount } from '@/lib/expenses-data';

const props = defineProps({
  data: { type: Array, required: true },
});

const COLORS = ['#F472B6', '#60A5FA', '#FBBF24', '#2DD4BF', '#4ADE80', '#9CA3AF'];

const total = computed(() => props.data.reduce((s, d) => s + d.value, 0));

const conic = computed(() => {
  if (!total.value || props.data.length === 0) return 'conic-gradient(#e5e7eb 0deg 360deg)';
  let acc = 0;
  const parts = [];
  props.data.forEach((d, i) => {
    const pct = (d.value / total.value) * 360;
    const start = acc;
    acc += pct;
    parts.push(`${COLORS[i % COLORS.length]} ${start}deg ${acc}deg`);
  });
  return `conic-gradient(${parts.join(', ')})`;
});
</script>

<template>
  <div class="flex flex-col items-center gap-6 md:flex-row md:justify-center">
    <div class="relative h-48 w-48 shrink-0">
      <div class="h-full w-full rounded-full shadow-inner" :style="{ background: conic }" />
      <div
        class="absolute left-1/2 top-1/2 h-[45%] w-[45%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-card shadow-md"
      />
    </div>
    <div class="grid grid-cols-2 gap-3 md:grid-cols-3">
      <div v-for="(item, index) in data" :key="item.name" class="flex items-center gap-2">
        <div
          class="h-3 w-3 shrink-0 rounded-full"
          :style="{ backgroundColor: COLORS[index % COLORS.length] }"
        />
        <span class="text-sm text-muted-foreground">
          {{ item.name }}: {{ formatAmount(item.value) }}
        </span>
      </div>
    </div>
  </div>
</template>

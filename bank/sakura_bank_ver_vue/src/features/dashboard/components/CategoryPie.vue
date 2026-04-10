<script setup>
import { computed } from 'vue';
import PieChart from '@/components/statistics/PieChart.vue';

const props = defineProps({
  data: { type: Array, default: () => [] },
});

const formatAmount = (val) => new Intl.NumberFormat('ko-KR').format(val) + '원';

const totalValue = computed(() =>
  props.data.reduce((acc, cur) => acc + cur.value, 0),
);

// 차트 데이터 가공
const formattedChartData = computed(() => ({
  labels: props.data.map((item) => item.name),
  datasets: [
    {
      data: props.data.map((item) => item.value),
      backgroundColor: props.data.map((item) => item.color),
      borderColor: '#ffffff',
      borderWidth: 2,
    },
  ],
}));

// 원형 차트 옵션 (통계 페이지와 통일)
const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      displayColors: false,
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
      titleFont: { size: 13, weight: 'bold' },
      bodyFont: { size: 12 },

      callbacks: {
        // 제목: 카테고리 이름
        title: function (context) {
          return context[0].label;
        },
        // 내용: oo원
        label: function (context) {
          const value = context.parsed.toLocaleString();
          return `${value}원`;
        },
      },
    },
  },
};
</script>

<template>
  <div
    class="flex flex-col lg:flex-row items-center gap-8 w-full h-full min-h-[300px]"
  >
    <div
      class="relative w-full lg:w-1/2 flex items-center justify-center overflow-hidden"
    >
      <div class="w-full max-w-[260px] aspect-square relative">
        <PieChart
          v-if="data && data.length > 0"
          :chart-data="formattedChartData"
          :chart-options="pieOptions"
        />

        <div
          class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        >
          <span class="text-[10px] text-muted-foreground font-medium"
            >Total</span
          >
          <span class="text-sm font-bold">{{ formatAmount(totalValue) }}</span>
        </div>
      </div>
    </div>

    <div class="w-full lg:w-1/2 flex flex-col justify-center">
      <h3
        class="text-[11px] font-bold text-slate-400 mb-4 hidden lg:block uppercase tracking-widest"
      >
        Top Categories
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
        <div
          v-for="(item, index) in data.slice(0, 5)"
          :key="index"
          class="flex items-center justify-between p-2 rounded-xl border-b border-slate-50 last:border-0"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-2.5 h-2.5 rounded-full shrink-0"
              :style="{ backgroundColor: item.color }"
            ></div>
            <div class="flex flex-col">
              <span class="text-sm font-bold text-slate-700 leading-none">{{
                item.name
              }}</span>
              <span class="text-[10px] text-muted-foreground mt-1">{{
                formatAmount(item.value)
              }}</span>
            </div>
          </div>
          <span class="text-[11px] font-bold text-slate-500">
            {{
              totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0
            }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

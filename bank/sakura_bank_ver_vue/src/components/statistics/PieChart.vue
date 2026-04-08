<template>
  <!-- 원형 차트 감싸는 컨테이너 -->
  <div class="chart-container">
    <!-- 데이터 존재할 때 렌더링 -->
    <Pie v-if="chartData" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Chart.js 구성 요소 등록
ChartJS.register(ArcElement, Tooltip, Legend);

// 부모 컴포넌트로부터 전달받는 props
// - chartData: 차트에 표시할 데이터
// - chartOptions: 차트 옵션 (기본: responsive)
defineProps({
  chartData: { type: Object, required: true },
  chartOptions: { type: Object, default: () => ({ responsive: true }) },
});
</script>

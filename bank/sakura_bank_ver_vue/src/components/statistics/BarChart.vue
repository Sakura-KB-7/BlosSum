<template>
  <!-- 막대 차트 감싸는 컨테이너 -->
  <div class="chart-container">
    <!-- 데이터 존재할 때 렌더링 -->
    <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from 'chart.js';

// 혼합 차트(막대 + 선)는 Controller를 반드시 등록해야 함
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

// 부모 컴포넌트로부터 전달받는 props
// - chartData: 차트에 표시할 데이터
// - chartOptions: 차트 옵션 (기본: responsive)
defineProps({
  chartData: { type: Object, required: true },
  chartOptions: { type: Object, default: () => ({ responsive: true }) },
});
</script>

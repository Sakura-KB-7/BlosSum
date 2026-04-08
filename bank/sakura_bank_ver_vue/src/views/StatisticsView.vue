<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { BarChart3, PieChart as PieIcon } from 'lucide-vue-next';
import UiCard from '@/shared/ui/UiCard.vue';
import { cn } from '@/shared/lib/utils';

// 차트 컴포넌트 (막대, 원형)
import BarChart from '@/components/statistics/BarChart.vue';
import PieChart from '@/components/statistics/PieChart.vue';

// 차트 데이터 상태
const barData = ref(null); // 월별 수입/지출 차트 데이터
const pieData = ref(null); // 카테고리별 지출 차트 데이터
const rawCategories = ref([]); // 카테고리 원본 데이터

// 원형 차트 우측에 표시할 카테고리 리스트
// - labels, data, colors를 객체로 묶음
// - 지출 금액 기준 내림차순 정렬
const categoryList = computed(() => {
  if (!pieData.value) return [];
  const labels = pieData.value.labels;
  const data = pieData.value.datasets[0].data;
  const colors = pieData.value.datasets[0].backgroundColor;

  return labels
    .map((name, i) => ({
      name,
      amount: data[i],
      color: colors[i],
    }))
    .sort((a, b) => b.amount - a.amount);
});

// 데이터 조회 및 가공
// - records: 수입/지출 내역
// - categories: 카테고리 정보
const fetchData = async () => {
  try {
    const [recordRes, categoryRes] = await Promise.all([
      axios.get('http://localhost:3000/records'),
      axios.get('http://localhost:3000/categories'),
    ]);

    const records = recordRes.data;
    rawCategories.value = categoryRes.data;

    // 최근 6개월 추이 데이터 가공
    const labels = [];
    const monthToIndex = {};
    const incomeValues = [];
    const expenseValues = [];

    const now = new Date();

    // 현재 달 포함 6개월 계산
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthNum = d.getMonth() + 1; // 1~12
      const monthStr = String(monthNum).padStart(2, '0'); // "01"

      const label = `${monthNum}월`;
      labels.push(label);

      // 월 -> 인덱스 매핑
      monthToIndex[monthStr] = labels.length - 1;

      // 데이터 초기화
      incomeValues.push(0);
      expenseValues.push(0);
    }

    // 월별 수입/지출 데이터 집계
    records.forEach((r) => {
      const month = r.date.split('-')[1];
      const idx = monthToIndex[month];

      if (idx !== undefined) {
        if (r.type === 'income') incomeValues[idx] += r.amount;
        else expenseValues[idx] += r.amount;
      }
    });

    // 막대 + 선 혼합 차트 데이터
    // 지출 -> 선 | 수입 -> 막대
    barData.value = {
      labels,
      datasets: [
        {
          type: 'line',
          label: '지출',
          data: expenseValues,
          borderColor: '#ff8faa',
          backgroundColor: '#ff8faa',
          tension: 0.4,
          borderWidth: 3,

          pointRadius: 5,
          pointBackgroundColor: '#ffffff',
          pointBorderWidth: 2,

          pointHoverBackgroundColor: '#ff8faa',
        },
        {
          type: 'bar',
          label: '수입',
          data: incomeValues,
          backgroundColor: '#c2e2cb',
          borderColor: '#5fb863',
          borderWidth: 2,
          borderRadius: 8,
          barPercentage: 0.6,
        },
      ],
    };

    // 현재 달의 카테고리별 지출 데이터 가공
    // 현재 월 지출 데이터 필터링
    const currentExpenses = records.filter(
      (r) => r.type === 'expense' && r.date.includes('-04-'),
    );

    // 카테고리 id -> 객체 매핑
    const catMap = {};
    rawCategories.value.forEach((c) => (catMap[c.id] = c));

    // 카테고리별 지출 합계 계산
    const agg = currentExpenses.reduce((acc, curr) => {
      const cat = catMap[curr.categoryId] || { name: '기타', color: '#888' };
      if (!acc[cat.name]) acc[cat.name] = { amount: 0, color: cat.color };
      acc[cat.name].amount += curr.amount;
      return acc;
    }, {});

    // 원형 차트 데이터
    pieData.value = {
      labels: Object.keys(agg),
      datasets: [
        {
          data: Object.values(agg).map((v) => v.amount),
          backgroundColor: Object.values(agg).map((v) => v.color),
          borderColor: '#ffffff',
          borderWidth: 1,

          hoverOffset: 10,
          hoverBorderColor: '#ffffff',
        },
      ],
    };
  } catch (err) {
    console.error(err);
  }
};

// 막대 차트 옵션
// - 튤립 커스터마이징 (막대 위에 마우스 올렸을 때)
const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  aspectRatio: 1.2, // 세로 간격 조절
  plugins: {
    tooltip: {
      enabled: true,
      displayColors: false, // 색상 박스 제거

      // 기본 제목 (월 정보) 제거
      titleMarginBottom: 0,
      titleSpacing: 0,
      titleFont: { size: 0 },

      callbacks: {
        title: () => '',
        label: function (context) {
          const label = context.dataset.label || '';
          const value = context.parsed.y.toLocaleString();
          return `${label} : ${value}원`;
        },
      },
    },
    legend: {
      position: 'top',
      align: 'end',
      labels: { usePointStyle: true, font: { size: 12, weight: '600' } },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      suggestedMax: 5000000,
      ticks: {
        stepSize: 1000000,
        callback: function (value) {
          return (value / 10000).toLocaleString() + '만';
        },
        padding: 5,
        font: { size: 11 },
      },
      grid: { color: 'rgba(0,0,0,0.05)' },
    },
    x: {
      ticks: { font: { size: 12, weight: '600' } },
      grid: { display: false },
    },
  },
};

// 원형 차트 옵션
// - 툴팁에 금액 표시 (원)
const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,

  layout: {
    padding: 20,
  },

  cutout: '75%', // 도넛 차트 두께
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      displayColors: false,
      callbacks: {
        title: function (context) {
          return context[0].label;
        },
        label: function (context) {
          const value = context.parsed.toLocaleString();
          return `${value}원`;
        },
      },
    },
  },
};

// 컴포넌트 마운트 시 데이터 로드
onMounted(fetchData);
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-foreground">소비 통계 리포트 📊</h1>
    </div>

    <div class="flex flex-col gap-6">
      <UiCard class="border-none bg-card/80 shadow-sm backdrop-blur-sm">
        <div class="flex items-center gap-2 p-6 pb-2">
          <BarChart3 class="h-5 w-5 text-primary" />
          <h2 class="text-lg font-semibold text-foreground">
            월별 수입/지출 추이
          </h2>
        </div>
        <div class="p-6">
          <div class="h-[300px] w-full">
            <BarChart
              v-if="barData"
              :chart-data="barData"
              :chart-options="barOptions"
            />
          </div>
        </div>
      </UiCard>

      <UiCard class="border-none bg-card/80 shadow-sm backdrop-blur-sm">
        <div class="flex items-center gap-2 p-6 pb-2">
          <PieIcon class="h-5 w-5 text-primary" />
          <h2 class="text-lg font-semibold text-foreground">
            {{ new Date().getMonth() + 1 }}월 카테고리별 지출
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          <div class="h-[300px]">
            <PieChart
              v-if="pieData"
              :chart-data="pieData"
              :chart-options="pieOptions"
            />
          </div>

          <div class="flex flex-col justify-center space-y-4">
            <div
              v-for="item in categoryList"
              :key="item.name"
              class="flex items-center justify-between border-b border-border/50 pb-2 last:border-0"
            >
              <div class="flex items-center gap-3">
                <span
                  class="h-3 w-3 rounded-full"
                  :style="{ backgroundColor: item.color }"
                ></span>
                <span class="font-medium text-foreground">{{ item.name }}</span>
              </div>
              <span class="font-bold text-foreground"
                >{{ item.amount.toLocaleString() }}원</span
              >
            </div>
          </div>
        </div>
      </UiCard>
    </div>
  </div>
</template>

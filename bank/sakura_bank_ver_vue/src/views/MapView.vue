<script setup lang="ts">
import { computed } from 'vue';
import { MapPin, Flower2, AlertTriangle } from 'lucide-vue-next';
import UiCard from '@/components/ui/UiCard.vue';
import { formatAmount } from '@/lib/expenses-data';
import { cn } from '@/lib/utils';

const locationData = [
  { id: 1, name: '강남역', x: 55, y: 45, type: 'warning' as const, amount: 125000, visits: 8 },
  { id: 2, name: '홍대입구', x: 35, y: 35, type: 'success' as const, amount: 32000, visits: 3 },
  { id: 3, name: '신촌', x: 38, y: 30, type: 'success' as const, amount: 28000, visits: 4 },
  { id: 4, name: '이태원', x: 52, y: 40, type: 'warning' as const, amount: 89000, visits: 5 },
  { id: 5, name: '잠실', x: 70, y: 48, type: 'success' as const, amount: 45000, visits: 6 },
  { id: 6, name: '여의도', x: 42, y: 50, type: 'success' as const, amount: 35000, visits: 2 },
  { id: 7, name: '명동', x: 50, y: 38, type: 'warning' as const, amount: 156000, visits: 10 },
  { id: 8, name: '압구정', x: 58, y: 42, type: 'warning' as const, amount: 203000, visits: 7 },
];

const successLocations = computed(() => locationData.filter((l) => l.type === 'success'));
const warningLocations = computed(() => locationData.filter((l) => l.type === 'warning'));
const topLocations = computed(() =>
  [...locationData].sort((a, b) => b.amount - a.amount).slice(0, 5)
);

function rankClass(index: number) {
  if (index === 0) return 'bg-amber-100 text-amber-700';
  if (index === 1) return 'bg-gray-200 text-gray-600';
  if (index === 2) return 'bg-amber-700/20 text-amber-800';
  return 'bg-gray-100 text-gray-500';
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-foreground">나의 소비 지도 🗺️</h1>
      <p class="text-muted-foreground">내가 어디서 돈을 많이 썼는지 한눈에 확인하세요</p>
    </div>

    <div class="flex flex-wrap gap-4">
      <div class="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2">
        <Flower2 class="h-4 w-4 text-green-600" />
        <span class="text-sm text-green-700">절약 성공 지역</span>
      </div>
      <div class="flex items-center gap-2 rounded-full bg-pink-100 px-4 py-2">
        <AlertTriangle class="h-4 w-4 text-pink-600" />
        <span class="text-sm text-pink-700">과소비 주의 지역</span>
      </div>
    </div>

    <UiCard class="border-none bg-card/80 shadow-sm backdrop-blur-sm">
      <div class="p-0">
        <div
          class="relative h-[500px] overflow-hidden rounded-xl bg-gradient-to-br from-green-50 to-blue-50"
        >
          <div
            class="absolute inset-0 opacity-20"
            style="
              background-image:
                radial-gradient(circle at 20% 30%, #86efac 0%, transparent 20%),
                radial-gradient(circle at 70% 60%, #93c5fd 0%, transparent 25%),
                radial-gradient(circle at 40% 70%, #fde68a 0%, transparent 15%),
                radial-gradient(circle at 80% 20%, #f9a8d4 0%, transparent 18%);
            "
          />
          <div
            class="absolute inset-0"
            style="
              background-image:
                linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
              background-size: 40px 40px;
            "
          />

          <div
            v-for="location in locationData"
            :key="location.id"
            class="group absolute cursor-pointer transition-transform hover:z-10 hover:scale-110"
            :style="{
              left: `${location.x}%`,
              top: `${location.y}%`,
              transform: 'translate(-50%, -50%)',
            }"
          >
            <div
              :class="
                cn(
                  'relative flex h-12 w-12 items-center justify-center rounded-full shadow-lg',
                  location.type === 'success'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-pink-100 text-pink-600'
                )
              "
            >
              <Flower2 v-if="location.type === 'success'" class="h-6 w-6" />
              <AlertTriangle v-else class="h-6 w-6" />
              <div
                v-if="location.type === 'warning'"
                class="absolute inset-0 animate-ping rounded-full bg-pink-400 opacity-30"
              />
            </div>
            <div
              class="absolute bottom-full left-1/2 mb-2 w-40 -translate-x-1/2 rounded-xl bg-card p-3 opacity-0 shadow-xl transition-all group-hover:opacity-100"
            >
              <p class="font-semibold text-foreground">{{ location.name }}</p>
              <p
                :class="
                  cn(
                    'text-sm font-medium',
                    location.type === 'success' ? 'text-green-600' : 'text-pink-600'
                  )
                "
              >
                {{ formatAmount(location.amount) }}
              </p>
              <p class="text-xs text-muted-foreground">방문 {{ location.visits }}회</p>
              <div class="absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-card" />
            </div>
          </div>

          <div class="absolute left-4 top-4 text-3xl opacity-40">🌸</div>
          <div class="absolute bottom-8 right-8 text-4xl opacity-40">🌸</div>
          <div class="absolute right-20 top-20 text-2xl opacity-30">🌸</div>
        </div>
      </div>
    </UiCard>

    <div class="grid gap-4 md:grid-cols-3">
      <UiCard class="border-none bg-card/80 shadow-sm backdrop-blur-sm">
        <div class="p-6 pb-2">
          <h3 class="text-sm font-medium text-muted-foreground">총 방문 장소</h3>
        </div>
        <div class="px-6 pb-6">
          <p class="text-2xl font-bold text-foreground">{{ locationData.length }}곳</p>
          <p class="text-sm text-muted-foreground">이번 달 소비 지역</p>
        </div>
      </UiCard>

      <UiCard class="border-none bg-green-50/80 shadow-sm backdrop-blur-sm">
        <div class="flex items-center gap-2 p-6 pb-2">
          <Flower2 class="h-4 w-4 text-green-600" />
          <h3 class="text-sm font-medium text-green-600">절약 성공</h3>
        </div>
        <div class="px-6 pb-6">
          <p class="text-2xl font-bold text-green-700">{{ successLocations.length }}곳</p>
          <p class="text-sm text-green-600">벚꽃이 피었어요!</p>
        </div>
      </UiCard>

      <UiCard class="border-none bg-pink-50/80 shadow-sm backdrop-blur-sm">
        <div class="flex items-center gap-2 p-6 pb-2">
          <AlertTriangle class="h-4 w-4 text-pink-600" />
          <h3 class="text-sm font-medium text-pink-600">과소비 주의</h3>
        </div>
        <div class="px-6 pb-6">
          <p class="text-2xl font-bold text-pink-700">{{ warningLocations.length }}곳</p>
          <p class="text-sm text-pink-600">조심해요!</p>
        </div>
      </UiCard>
    </div>

    <UiCard class="border-none bg-card/80 shadow-sm backdrop-blur-sm">
      <div class="p-6 pb-2">
        <h2 class="text-lg font-semibold">TOP 소비 지역</h2>
      </div>
      <div class="space-y-3 px-6 pb-6">
        <div
          v-for="(location, index) in topLocations"
          :key="location.id"
          class="flex items-center gap-4 rounded-xl bg-secondary/50 p-3"
        >
          <div
            :class="
              cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                rankClass(index)
              )
            "
          >
            {{ index + 1 }}
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <MapPin class="h-4 w-4 text-muted-foreground" />
              <span class="font-medium text-foreground">{{ location.name }}</span>
            </div>
            <p class="text-xs text-muted-foreground">방문 {{ location.visits }}회</p>
          </div>
          <p
            :class="
              cn('font-semibold', location.type === 'success' ? 'text-green-600' : 'text-pink-600')
            "
          >
            {{ formatAmount(location.amount) }}
          </p>
        </div>
      </div>
    </UiCard>
  </div>
</template>

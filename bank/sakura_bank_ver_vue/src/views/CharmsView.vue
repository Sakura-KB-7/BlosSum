<script setup>
import { computed } from 'vue';
import { Lock, Sparkles } from 'lucide-vue-next';
import UiCard from '@/shared/ui/UiCard.vue';
import { charms, expenses, formatAmount, categoryInfo } from '@/lib/expenses-data';
import { cn } from '@/shared/lib/utils';

const unlockedCount = computed(() => charms.filter((c) => c.unlocked).length);
const recentExpenses = computed(() => expenses.slice(0, 6));
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-foreground">부적 콜렉션 & 영수증 다꾸 ✨</h1>
      <p class="text-muted-foreground">절약 목표를 달성하고 예쁜 부적을 모아보세요!</p>
    </div>

    <UiCard
      class="border-none bg-gradient-to-r from-primary/10 to-amber-100/50 shadow-sm backdrop-blur-sm"
    >
      <div class="flex items-center justify-between p-6">
        <div>
          <p class="text-sm text-muted-foreground">수집한 부적</p>
          <p class="text-3xl font-bold text-foreground">
            {{ unlockedCount }} / {{ charms.length }}
          </p>
        </div>
        <div
          class="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-primary/30"
        >
          <Sparkles class="h-10 w-10 text-amber-600" />
        </div>
      </div>
    </UiCard>

    <UiCard class="border-none bg-card/80 shadow-sm backdrop-blur-sm">
      <div class="p-6 pb-2">
        <h2 class="flex items-center gap-2 text-lg font-semibold">
          <span class="text-xl">🔮</span>
          부적 갤러리
        </h2>
      </div>
      <div class="px-6 pb-6">
        <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div
            v-for="charm in charms"
            :key="charm.id"
            :class="
              cn(
                'group relative cursor-pointer transition-all',
                charm.unlocked && 'hover:-translate-y-2'
              )
            "
          >
            <div
              v-if="charm.unlocked"
              class="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-amber-300/20 opacity-0 blur-xl transition-all group-hover:opacity-100"
            />
            <div
              :class="
                cn(
                  'relative flex h-40 flex-col items-center justify-center rounded-2xl border-2 p-4 transition-all',
                  charm.unlocked
                    ? 'border-amber-300/50 bg-gradient-to-br from-amber-50 to-pink-50 shadow-lg'
                    : 'border-dashed border-gray-300 bg-gray-100/50'
                )
              "
            >
              <div
                :class="
                  cn(
                    'absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-2',
                    charm.unlocked ? 'border-amber-300 bg-amber-100' : 'border-gray-300 bg-gray-200'
                  )
                "
              />
              <template v-if="charm.unlocked">
                <span class="mb-2 text-4xl">{{ charm.icon }}</span>
                <p class="text-center text-sm font-medium text-foreground">{{ charm.name }}</p>
              </template>
              <template v-else>
                <Lock class="mb-2 h-8 w-8 text-gray-400" />
                <p class="text-center text-xs text-muted-foreground">미획득</p>
              </template>
            </div>
            <div
              class="absolute -bottom-12 left-1/2 z-10 w-32 -translate-x-1/2 rounded-lg bg-foreground p-2 text-center text-xs text-background opacity-0 transition-all group-hover:opacity-100"
            >
              {{ charm.description }}
            </div>
          </div>
        </div>
      </div>
    </UiCard>

    <UiCard class="border-none bg-card/80 shadow-sm backdrop-blur-sm">
      <div class="p-6 pb-2">
        <h2 class="flex items-center gap-2 text-lg font-semibold">
          <span class="text-xl">🎨</span>
          영수증 다꾸
        </h2>
      </div>
      <div class="px-6 pb-6">
        <div
          class="relative min-h-[400px] rounded-xl bg-amber-100/50 p-6"
          style="
            background-image: url(&quot;data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a574' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E&quot;);
          "
        >
          <div class="grid grid-cols-2 gap-6 md:grid-cols-3">
            <div
              v-for="(expense, index) in recentExpenses"
              :key="expense.id"
              class="group relative"
              :style="{ transform: `rotate(${((index % 3) - 1) * 3}deg)` }"
            >
              <div
                :class="
                  cn(
                    'absolute -top-3 left-1/2 z-10 h-6 w-16 -translate-x-1/2 rotate-[-2deg] rounded-sm opacity-80',
                    index % 3 === 0
                      ? 'bg-pink-200'
                      : index % 3 === 1
                        ? 'bg-blue-200'
                        : 'bg-amber-200'
                  )
                "
              />
              <div
                class="rounded-lg bg-white p-3 shadow-md transition-all group-hover:-translate-y-1 group-hover:shadow-lg"
              >
                <div
                  :class="
                    cn(
                      'mb-3 flex h-24 items-center justify-center rounded-lg',
                      categoryInfo[expense.category]?.bgColor
                    )
                  "
                >
                  <span class="text-4xl">{{ expense.icon }}</span>
                </div>
                <div class="space-y-1">
                  <p class="truncate text-sm font-medium text-foreground">{{ expense.store }}</p>
                  <p class="text-xs text-muted-foreground">{{ expense.date }}</p>
                  <p class="font-semibold text-pink-600">-{{ formatAmount(expense.amount) }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="absolute bottom-4 right-4 text-4xl opacity-50">🌸</div>
          <div class="absolute left-4 top-4 text-2xl opacity-50">✨</div>
        </div>
      </div>
    </UiCard>
  </div>
</template>

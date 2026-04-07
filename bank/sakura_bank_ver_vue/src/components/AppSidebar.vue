<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import {
  Home,
  Calendar,
  Sparkles,
  Map,
  Newspaper,
  ChevronLeft,
  ChevronRight,
  List,
  PlusCircle,
  Settings,
} from 'lucide-vue-next';
import { cn } from '@/shared/lib/utils';
import { useBudgetStore } from '@/features/transactions/stores/budget';
import { useCategoryStore } from '@/features/transactions/stores/categories';
import { useProfileStore } from '@/stores/profile';

const route = useRoute();
const collapsed = ref(false);
const budget = useBudgetStore();
const categories = useCategoryStore();
const profile = useProfileStore();

const navItems = [
  { id: 'dashboard', label: '내 지갑', to: '/dashboard', icon: Home },
  { id: 'calendar', label: '캘린더 가계부', to: '/calendar', icon: Calendar },
  { id: 'charms', label: '부적 콜렉션', to: '/charms', icon: Sparkles },
  { id: 'map', label: '소비 지도', to: '/map', icon: Map },
  { id: 'newsletter', label: 'AI 소식지', to: '/newsletter', icon: Newspaper },
] as const;

const extraItems = [
  { id: 'transactions', label: '거래 내역', to: '/transactions', icon: List },
  { id: 'transaction-new', label: '거래 등록', to: '/transactions/new', icon: PlusCircle },
  { id: 'settings', label: '설정', to: '/settings', icon: Settings },
] as const;

const displayName = computed(() => profile.profile?.name || '사용자님');

function isMainActive(to: string) {
  return route.path === to || (to === '/dashboard' && route.path === '/');
}

function isExtraActive(item: (typeof extraItems)[number]) {
  if (item.to === '/transactions')
    return route.name === 'transactions' || route.name === 'transaction-edit';
  if (item.to === '/transactions/new') return route.name === 'transaction-new';
  return route.path === item.to;
}

onMounted(async () => {
  await Promise.all([budget.fetchAll(), categories.fetchAll(), profile.fetchAll()]);
});
</script>

<template>
  <aside
    :class="
      cn(
        'relative flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )
    "
  >
    <div class="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-lg"
      >
        🌸
      </div>
      <div v-if="!collapsed" class="flex flex-col">
        <span class="font-semibold text-sidebar-foreground">봄지갑</span>
        <span class="text-xs text-muted-foreground">Spring Wallet</span>
      </div>
    </div>

    <div v-if="!collapsed" class="border-b border-sidebar-border p-4">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-lg">
          🧑‍💻
        </div>
        <div>
          <p class="text-sm font-medium text-sidebar-foreground">{{ displayName }}</p>
          <p class="text-xs text-muted-foreground">절약 레벨 Lv.3</p>
        </div>
      </div>
    </div>

    <nav class="flex-1 space-y-1 overflow-y-auto p-2">
      <RouterLink
        v-for="item in navItems"
        :key="item.id"
        :to="item.to"
        :class="
          cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
            isMainActive(item.to)
              ? 'bg-sidebar-accent text-sidebar-primary'
              : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
          )
        "
      >
        <component
          :is="item.icon"
          :class="cn('h-5 w-5 shrink-0', isMainActive(item.to) && 'text-primary')"
        />
        <span v-if="!collapsed">{{ item.label }}</span>
      </RouterLink>

      <div v-if="!collapsed" class="px-1 pt-3 text-xs font-semibold text-muted-foreground">
        과제 메뉴
      </div>

      <RouterLink
        v-for="item in extraItems"
        :key="item.id"
        :to="item.to"
        :class="
          cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
            isExtraActive(item)
              ? 'bg-sidebar-accent text-sidebar-primary'
              : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
          )
        "
      >
        <component :is="item.icon" class="h-5 w-5 shrink-0" />
        <span v-if="!collapsed">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <button
      type="button"
      class="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-muted-foreground shadow-sm hover:bg-sidebar-accent"
      @click="collapsed = !collapsed"
    >
      <ChevronRight v-if="collapsed" class="h-3 w-3" />
      <ChevronLeft v-else class="h-3 w-3" />
    </button>

    <div v-if="!collapsed" class="border-t border-sidebar-border p-4">
      <div class="rounded-xl bg-primary/10 p-3 text-center">
        <p class="text-xs text-muted-foreground">이번 달 절약 목표</p>
        <p class="text-lg font-bold text-primary">72%</p>
        <div class="mt-2 h-2 overflow-hidden rounded-full bg-primary/20">
          <div class="h-full w-[72%] rounded-full bg-primary transition-all" />
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import UiCard from '@/shared/ui/UiCard.vue';
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2">
    <UiCard class="h-[220px] border-none bg-card/80 shadow-sm backdrop-blur-sm">
      <div class="space-y-4 p-5">
        <div class="h-4 w-20 animate-pulse rounded-full bg-secondary/80" />
        <div class="h-8 w-24 animate-pulse rounded-2xl bg-secondary/80" />
        <div class="grid gap-2 sm:grid-cols-2">
          <div
            v-for="index in 4"
            :key="index"
            class="flex items-center justify-between rounded-2xl bg-secondary/70 px-3 py-2.5"
          >
            <div class="h-4 w-14 animate-pulse rounded-full bg-background/90" />
            <div class="h-6 w-8 animate-pulse rounded-full bg-background/90" />
          </div>
        </div>
      </div>
    </UiCard>
    <UiCard class="h-[220px] border-none bg-card/80 shadow-sm backdrop-blur-sm">
      <div class="space-y-4 p-5">
        <div class="h-4 w-24 animate-pulse rounded-full bg-secondary/80" />
        <div class="h-8 w-16 animate-pulse rounded-2xl bg-secondary/80" />
        <div v-for="index in 2" :key="index" class="rounded-2xl bg-secondary/70 px-4 py-2.5">
          <div class="h-4 w-32 animate-pulse rounded-full bg-background/90" />
          <div class="mt-2 h-3 w-12 animate-pulse rounded-full bg-background/90" />
        </div>
      </div>
    </UiCard>
  </div>
</template>

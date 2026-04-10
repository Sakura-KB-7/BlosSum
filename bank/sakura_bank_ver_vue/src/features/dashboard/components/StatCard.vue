<script setup>
import UiCard from '@/shared/ui/UiCard.vue';
import { cn } from '@/shared/lib/utils';

const props = defineProps({
  title: { type: String, required: true },
  amount: { type: String, required: true },
  icon: { type: [Object, Function], required: true },
  iconBg: { type: String, default: 'bg-primary/10' },
  iconColor: { type: String, default: 'text-primary' },
});
</script>

<template>
  <UiCard
    :class="
      cn(
        'border-none bg-card/80 shadow-sm backdrop-blur-sm p-5 md:p-6 flex flex-col transition-all',
        'min-h-[11rem] h-auto md:h-44', // 반응형
        props.class,
      )
    "
  >
    <div class="flex-none mb-3">
      <div class="inline-flex p-2.5 rounded-2xl" :class="iconBg">
        <component
          :is="icon"
          class="h-5 w-5 md:h-6 md:w-6"
          :class="iconColor"
        />
      </div>
    </div>

    <div class="mt-auto flex flex-col gap-1">
      <p class="text-[10px] md:text-[11px] font-medium text-muted-foreground">
        {{ title }}
      </p>

      <div class="flex flex-wrap items-baseline justify-between gap-x-2">
        <p class="text-xl md:text-2xl font-bold text-foreground tracking-tight">
          {{ amount }}
        </p>
        <slot name="extra" />
      </div>

      <div class="w-full mt-2">
        <slot name="footer" />
      </div>
    </div>
  </UiCard>
</template>

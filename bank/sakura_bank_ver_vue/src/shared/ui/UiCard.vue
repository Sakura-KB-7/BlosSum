<script setup>
import { cn } from '@/shared/lib/utils';

const props = defineProps({
  class: { type: String, default: undefined },
});
</script>

<template>
  <div
    :class="
      cn('rounded-xl border border-border bg-card text-card-foreground shadow-sm', props.class)
    "
  >
    <slot />
  </div>
</template>

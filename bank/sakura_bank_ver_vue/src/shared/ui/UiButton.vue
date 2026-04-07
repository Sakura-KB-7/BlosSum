<script setup>
import { cn } from '@/shared/lib/utils';

const props = defineProps({
  variant: { type: String, default: 'default' },
  size: { type: String, default: 'default' },
  type: { type: String, default: 'button' },
  class: { type: String, default: undefined },
});
</script>

<template>
  <button
    :type="type"
    :class="
      cn(
        'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
        props.variant === 'default' &&
          'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        props.variant === 'outline' &&
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        props.variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
        props.size === 'default' && 'h-10 px-4 py-2',
        props.size === 'sm' && 'h-9 rounded-md px-3',
        props.size === 'icon' && 'h-9 w-9',
        props.class
      )
    "
  >
    <slot />
  </button>
</template>

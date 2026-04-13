<script setup>
import { AlertCircle, CheckCircle2, Trash2 } from 'lucide-vue-next';

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  confirmText: {
    type: String,
    default: '확인',
  },
  cancelText: {
    type: String,
    default: '취소',
  },
  showCancel: {
    type: Boolean,
    default: false,
  },
  tone: {
    type: String,
    default: 'default',
  },
});

const emit = defineEmits(['close', 'confirm']);
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[90] flex items-center justify-center bg-black/35 px-4 backdrop-blur-[2px]"
      @click.self="emit('close')"
    >
      <div
        class="w-full max-w-sm rounded-3xl border border-sidebar-border bg-sidebar p-6 shadow-2xl"
      >
        <div class="flex items-start gap-4">
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
            :class="
              tone === 'success'
                ? 'bg-emerald-100 text-emerald-600'
                : tone === 'danger'
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-primary/12 text-primary'
            "
          >
            <CheckCircle2 v-if="tone === 'success'" class="h-5 w-5" />
            <Trash2 v-else-if="tone === 'danger'" class="h-5 w-5" />
            <AlertCircle v-else class="h-5 w-5" />
          </div>
          <div class="min-w-0">
            <h2 class="text-lg font-semibold text-sidebar-foreground">{{ title }}</h2>
            <p class="mt-1 text-sm leading-6 text-muted-foreground">{{ description }}</p>
          </div>
        </div>

        <div class="mt-6 flex items-center justify-end gap-2">
          <button
            v-if="showCancel"
            type="button"
            class="rounded-xl border border-sidebar-border px-4 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50"
            @click="emit('close')"
          >
            {{ cancelText }}
          </button>
          <button
            type="button"
            class="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            @click="emit('confirm')"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

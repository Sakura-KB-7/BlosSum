<script setup>
import { DoorOpen } from 'lucide-vue-next';

defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'confirm']);
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 backdrop-blur-[2px]"
    @click.self="emit('close')"
  >
    <div
      class="w-full max-w-sm rounded-3xl border border-sidebar-border bg-sidebar p-6 shadow-2xl"
    >
      <div class="flex items-start gap-4">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary"
        >
          <DoorOpen class="h-5 w-5" />
        </div>
        <div class="min-w-0">
          <h2 class="text-lg font-semibold text-sidebar-foreground">
            로그아웃할까요?
          </h2>
          <p class="mt-1 text-sm leading-6 text-muted-foreground">
            현재 계정에서 나가고 로그인 화면으로 이동합니다.
          </p>
        </div>
      </div>

      <div class="mt-6 flex items-center justify-end gap-2">
        <button
          type="button"
          class="rounded-xl border border-sidebar-border px-4 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50"
          @click="emit('close')"
        >
          취소
        </button>
        <button
          type="button"
          class="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          @click="emit('confirm')"
        >
          로그아웃
        </button>
      </div>
    </div>
  </div>
</template>

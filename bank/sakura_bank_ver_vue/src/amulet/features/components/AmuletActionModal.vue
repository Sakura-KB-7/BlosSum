<script setup>
import { Sparkles, Trash2 } from 'lucide-vue-next';

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
  confirmTone: {
    type: String,
    default: 'primary',
  },
  showCancel: {
    type: Boolean,
    default: true,
  },
  icon: {
    type: String,
    default: 'sparkles',
  },
});

const emit = defineEmits(['close', 'confirm']);
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[80] flex items-center justify-center bg-black/35 px-4 backdrop-blur-[2px]"
      @click.self="emit('close')"
    >
      <div
        class="w-full max-w-sm rounded-3xl border border-[#F1D8E2] bg-[#FFF9FC] p-6 shadow-[0_24px_80px_rgba(192,132,154,0.22)]"
      >
        <div class="flex items-start gap-4">
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FCE7F3] text-[#D95C8A]"
          >
            <Sparkles v-if="icon === 'sparkles'" class="h-5 w-5" />
            <Trash2 v-else class="h-5 w-5" />
          </div>
          <div class="min-w-0">
            <h2 class="text-lg font-semibold text-[#5C4A4E]">
              {{ title }}
            </h2>
            <p class="mt-1 text-sm leading-6 text-[#9F7F88]">
              {{ description }}
            </p>
          </div>
        </div>

        <div class="mt-6 flex items-center justify-end gap-2">
          <button
            v-if="showCancel"
            type="button"
            class="rounded-xl border border-[#F1D8E2] bg-white px-4 py-2 text-sm font-medium text-[#7B646B] transition-colors hover:bg-[#FFF1F7]"
            @click="emit('close')"
          >
            {{ cancelText }}
          </button>
          <button
            type="button"
            :class="
              confirmTone === 'danger'
                ? 'rounded-xl bg-[#E07A9B] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90'
                : 'rounded-xl bg-[#E07A9B] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90'
            "
            @click="emit('confirm')"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

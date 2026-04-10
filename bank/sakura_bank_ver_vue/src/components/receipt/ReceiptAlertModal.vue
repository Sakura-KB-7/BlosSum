<script setup>
import { AlertCircle, CheckCircle2 } from 'lucide-vue-next';

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
      class="fixed inset-0 z-[80] flex items-center justify-center bg-black/35 px-4 backdrop-blur-[2px]"
      @click.self="emit('close')"
    >
      <div
        class="w-full max-w-sm rounded-3xl border border-[#F6D9DF] bg-[#FFF9FB] p-6 shadow-[0_24px_80px_rgba(192,132,154,0.22)]"
      >
        <div class="flex items-start gap-4">
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
            :class="
              tone === 'success'
                ? 'bg-[#E8F7EE] text-[#2E9B62]'
                : 'bg-[#FDECEF] text-[#E07A9B]'
            "
          >
            <CheckCircle2 v-if="tone === 'success'" class="h-5 w-5" />
            <AlertCircle v-else class="h-5 w-5" />
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

        <div class="mt-6 flex items-center justify-end">
          <button
            type="button"
            class="rounded-xl bg-[#E07A9B] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            @click="emit('confirm')"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

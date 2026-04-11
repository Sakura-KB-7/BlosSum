<script setup>
import { computed } from 'vue';
import LoadingStage from '@/loading/components/LoadingStage.vue';
import { useLoadingStore } from '@/stores/loading';

const loadingStore = useLoadingStore();

const isVisible = computed(() => loadingStore.overlay.visible);
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay-fade">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/35 px-6 backdrop-blur-sm"
      >
        <div class="w-full max-w-md rounded-3xl border border-white/40 bg-white/90 p-6 shadow-2xl">
          <LoadingStage
            :key="loadingStore.overlay.key"
            :auto-complete="false"
            :finishing="loadingStore.overlay.finishing"
            :variant="loadingStore.overlay.variant"
            :title="loadingStore.overlay.title"
            :description="loadingStore.overlay.description"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.18s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}
</style>

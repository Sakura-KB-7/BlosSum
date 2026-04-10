import { reactive } from 'vue';
import { defineStore } from 'pinia';
import { pickRandomLoadingVariant } from '@/loading/constants';

export const useLoadingStore = defineStore('loading', () => {
  const overlay = reactive({
    visible: false,
    key: 0,
    context: '',
    title: '처리 중입니다',
    description: '잠시만 기다려 주세요.',
    variant: pickRandomLoadingVariant(),
  });

  function showOverlay(options = {}) {
    overlay.visible = true;
    overlay.key += 1;
    overlay.context = options.context || '';
    overlay.title = options.title || '처리 중입니다';
    overlay.description = options.description || '잠시만 기다려 주세요.';
    overlay.variant = pickRandomLoadingVariant();
  }

  function hideOverlay() {
    overlay.visible = false;
  }

  return {
    overlay,
    showOverlay,
    hideOverlay,
  };
});

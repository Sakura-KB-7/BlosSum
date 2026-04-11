import { reactive } from 'vue';
import { defineStore } from 'pinia';
import { pickRandomLoadingVariant } from '@/loading/constants';

const FINISH_ANIMATION_MS = 240;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const useLoadingStore = defineStore('loading', () => {
  const overlay = reactive({
    visible: false,
    key: 0,
    context: '',
    title: '처리 중입니다',
    description: '잠시만 기다려 주세요.',
    variant: pickRandomLoadingVariant(),
    finishing: false,
    startedAt: 0,
    minDurationMs: 900,
  });

  function showOverlay(options = {}) {
    overlay.key += 1;
    overlay.visible = true;
    overlay.finishing = false;
    overlay.context = options.context || '';
    overlay.title = options.title || '처리 중입니다';
    overlay.description = options.description || '잠시만 기다려 주세요.';
    overlay.variant = pickRandomLoadingVariant();
    overlay.startedAt = Date.now();
    overlay.minDurationMs = Math.max(0, Number(options.minDurationMs ?? 900) || 900);
  }

  async function hideOverlay() {
    if (!overlay.visible) return;
    const currentKey = overlay.key;
    const elapsed = Date.now() - overlay.startedAt;
    const remaining = Math.max(0, overlay.minDurationMs - elapsed);
    if (remaining > 0) {
      await wait(remaining);
    }

    // 그 사이 다른 오버레이가 시작됐으면 현재 hide는 무시한다.
    if (currentKey !== overlay.key || !overlay.visible) return;

    overlay.finishing = true;
    await wait(FINISH_ANIMATION_MS);
    if (currentKey !== overlay.key) return;

    overlay.visible = false;
    overlay.finishing = false;
  }

  return {
    overlay,
    showOverlay,
    hideOverlay,
  };
});

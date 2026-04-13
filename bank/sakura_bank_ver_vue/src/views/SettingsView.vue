<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import UiCard from '@/shared/ui/UiCard.vue';
import UiButton from '@/shared/ui/UiButton.vue';
import UiAlertDialog from '@/shared/ui/UiAlertDialog.vue';
import { useProfileStore } from '@/stores/profile';
import pkg from '../../package.json';

const profile = useProfileStore();

const name = ref('');
const email = ref('');
const monthlyBudget = ref(0);
const currency = ref('KRW');
const saving = ref(false);
const alertOpen = ref(false);
const alertTitle = ref('');
const alertDescription = ref('');
const alertTone = ref('default');

const THEME_KEY = 'blosum_settings_theme';
const NEWSLETTER_PREFIX = 'blosum_newsletter_v1_';

const themeMode = ref('system');
let systemMq = null;

function applyTheme(mode) {
  const root = document.documentElement;
  root.classList.remove('dark');
  if (mode === 'dark') root.classList.add('dark');
  else if (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    root.classList.add('dark');
  }
}

function onSystemChange() {
  if (themeMode.value === 'system') applyTheme('system');
}

function loadTheme() {
  const v = localStorage.getItem(THEME_KEY);
  if (v === 'light' || v === 'dark' || v === 'system') themeMode.value = v;
  else themeMode.value = 'system';
  applyTheme(themeMode.value);
}

function setTheme(mode) {
  themeMode.value = mode;
  localStorage.setItem(THEME_KEY, mode);
  applyTheme(mode);
}

const appVersion = computed(() => pkg.version ?? '—');
const envMode = computed(() => import.meta.env.MODE);

function openAlert(title, description, tone = 'default') {
  alertTitle.value = title;
  alertDescription.value = description;
  alertTone.value = tone;
  alertOpen.value = true;
}

onMounted(async () => {
  loadTheme();
  systemMq = window.matchMedia('(prefers-color-scheme: dark)');
  systemMq.addEventListener('change', onSystemChange);
  await profile.fetchAll();
});

onUnmounted(() => {
  systemMq?.removeEventListener('change', onSystemChange);
});

watch(
  () => profile.profile,
  (p) => {
    name.value = p?.name ?? '';
    email.value = p?.email ?? '';
    monthlyBudget.value = Number(p?.monthlyBudget ?? 0);
    currency.value = p?.currency ?? 'KRW';
  },
  { immediate: true }
);

async function onSave() {
  saving.value = true;
  try {
    await profile.save({
      name: name.value,
      email: email.value,
      monthlyBudget: Math.max(0, Number(monthlyBudget.value) || 0),
      currency: currency.value,
    });
    openAlert('저장 완료', '설정이 정상적으로 저장되었습니다.', 'success');
  } catch (error) {
    openAlert('저장 실패', '설정을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.', 'danger');
  } finally {
    saving.value = false;
  }
}

function clearNewsletterCache() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const k = localStorage.key(i);
    if (k?.startsWith(NEWSLETTER_PREFIX)) keys.push(k);
  }
  if (keys.length === 0) {
    openAlert('안내', '지울 AI 소식지 저장 데이터가 없습니다.');
    return;
  }
  keys.forEach((k) => localStorage.removeItem(k));
  openAlert('삭제 완료', `AI 소식지 저장 ${keys.length}건을 지웠습니다.`, 'success');
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-foreground">설정 · 프로필 ⚙️</h1>
      <p class="text-muted-foreground">
        이름·연락처·예산과, 이 기기에서만 쓰는 화면·캐시 설정을 바꿀 수 있어요.
      </p>
    </div>

    <UiCard class="max-w-lg border-none bg-card/80 shadow-sm backdrop-blur-sm">
      <form class="flex flex-col gap-4 p-6" @submit.prevent="onSave">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold" for="n">이름</label>
          <input
            id="n"
            v-model="name"
            type="text"
            autocomplete="name"
            class="rounded-lg border border-input bg-background px-3 py-2"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold" for="e">이메일</label>
          <input
            id="e"
            v-model="email"
            type="email"
            autocomplete="email"
            class="rounded-lg border border-input bg-background px-3 py-2"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold" for="b">월 예산 (원)</label>
          <input
            id="b"
            v-model.number="monthlyBudget"
            type="number"
            min="0"
            step="10000"
            class="rounded-lg border border-input bg-background px-3 py-2"
          />
          <span class="text-xs text-muted-foreground">대시보드·목표 진행에 반영됩니다.</span>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold" for="c">통화</label>
          <select
            id="c"
            v-model="currency"
            class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="KRW">원 (KRW)</option>
            <option value="USD">달러 (USD)</option>
          </select>
        </div>
        <UiButton type="submit" class="w-fit" :disabled="saving || profile.loading">
          {{ saving ? '저장 중…' : '저장' }}
        </UiButton>
      </form>
    </UiCard>

    <UiCard class="max-w-lg border-none bg-card/80 shadow-sm backdrop-blur-sm">
      <div class="border-b border-border/50 px-6 py-3">
        <p class="text-xs font-semibold text-foreground">화면 (이 브라우저만)</p>
      </div>
      <div class="flex flex-wrap gap-2 p-6 pt-4">
        <UiButton
          type="button"
          size="sm"
          :variant="themeMode === 'light' ? 'default' : 'outline'"
          @click="setTheme('light')"
        >
          라이트
        </UiButton>
        <UiButton
          type="button"
          size="sm"
          :variant="themeMode === 'dark' ? 'default' : 'outline'"
          @click="setTheme('dark')"
        >
          다크
        </UiButton>
        <UiButton
          type="button"
          size="sm"
          :variant="themeMode === 'system' ? 'default' : 'outline'"
          @click="setTheme('system')"
        >
          시스템
        </UiButton>
      </div>
    </UiCard>

    <UiCard class="max-w-lg border-none bg-card/80 shadow-sm backdrop-blur-sm">
      <div class="border-b border-border/50 px-6 py-3">
        <p class="text-xs font-semibold text-foreground">AI 소식지</p>
      </div>
      <div class="space-y-3 p-6 pt-4">
        <p class="text-sm text-muted-foreground">
          생성해 둔 소식지 카드는 새로고침 후에도 보이도록 이 기기에만 저장됩니다.
        </p>
        <UiButton type="button" variant="outline" class="w-fit" @click="clearNewsletterCache">
          저장된 소식지 지우기
        </UiButton>
      </div>
    </UiCard>

    <UiCard
      class="max-w-lg border-none bg-card/80 p-6 text-sm text-muted-foreground shadow-sm backdrop-blur-sm"
    >
      <p>
        앱 버전
        <span class="font-medium text-foreground">{{ appVersion }}</span>
      </p>
      <p class="mt-1">모드 {{ envMode }}</p>
    </UiCard>

    <UiAlertDialog
      :open="alertOpen"
      :title="alertTitle"
      :description="alertDescription"
      :tone="alertTone"
      confirm-text="확인"
      @close="alertOpen = false"
      @confirm="alertOpen = false"
    />
  </div>
</template>

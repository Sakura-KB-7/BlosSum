<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowRight } from 'lucide-vue-next';
import { http } from '@/api/http';
import CherryBlossomBackground from '@/components/CherryBlossomBackground.vue';
import { useAuthStore } from '@/stores/auth';
import UiButton from '@/shared/ui/UiButton.vue';
import UiCard from '@/shared/ui/UiCard.vue';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const username = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

onMounted(() => {
  if (typeof route.query.userId === 'string') {
    username.value = route.query.userId;
  }
  if (route.query.created === '1') {
    successMessage.value = '아이디가 만들어졌습니다. 로그인해 주세요.';
  }
});

async function onSubmit() {
  errorMessage.value = '';
  successMessage.value = '';

  const trimmedUserId = username.value.trim();
  const trimmedPassword = password.value.trim();

  if (!trimmedUserId || !trimmedPassword) {
    errorMessage.value = '아이디와 비밀번호를 입력하세요.';
    return;
  }

  loading.value = true;
  try {
    const { data } = await http.get('/users', {
      params: { userId: trimmedUserId },
    });

    const user = Array.isArray(data) ? data[0] : null;
    if (!user || user.password !== trimmedPassword) {
      errorMessage.value = '아이디 또는 비밀번호가 올바르지 않습니다.';
      return;
    }

    auth.login(user.userId);
    router.push({ name: 'dashboard' });
  } catch (error) {
    errorMessage.value = '로그인하지 못했습니다. json-server 상태를 확인하세요.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div
    class="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(255,245,247,0.92)_30%,_rgba(255,239,214,0.75)_65%,_rgba(255,228,238,0.92)_100%)]"
  >
    <CherryBlossomBackground />

    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute -left-16 top-20 h-72 w-72 rounded-full bg-primary/18 blur-3xl" />
      <div class="absolute right-0 top-0 h-80 w-80 rounded-full bg-amber-200/35 blur-3xl" />
      <div class="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-rose-200/30 blur-3xl" />
    </div>

    <div class="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-10">
      <UiCard
        class="w-full max-w-xl border-white/70 bg-white/82 p-7 shadow-[0_24px_70px_rgba(165,110,125,0.14)] backdrop-blur-xl sm:p-8"
      >
        <div class="mx-auto flex max-w-md flex-col gap-6">
          <div class="space-y-3 text-center">
            <div class="inline-flex items-center justify-center">
              <div class="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/80 to-amber-300/80 text-2xl shadow-lg">
                🌸
              </div>
            </div>
            <div>
              <h2 class="text-2xl font-semibold text-foreground">로그인</h2>
              <p class="mt-2 text-sm leading-6 text-muted-foreground">
                아이디와 비밀번호를 입력해 봄지갑으로 들어갑니다.
              </p>
            </div>
          </div>

          <form class="space-y-5" @submit.prevent="onSubmit">
            <label class="block space-y-2">
              <span class="text-sm font-medium text-foreground">아이디</span>
              <input
                v-model="username"
                type="text"
                placeholder="아이디를 입력하세요"
                class="h-12 w-full rounded-2xl border border-border bg-white/80 px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </label>

            <label class="block space-y-2">
              <span class="text-sm font-medium text-foreground">비밀번호</span>
              <input
                v-model="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                class="h-12 w-full rounded-2xl border border-border bg-white/80 px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </label>

            <div class="flex justify-end">
              <button
                type="button"
                class="text-sm font-medium text-primary underline-offset-4 transition hover:underline"
              >
                비밀번호 찾기
              </button>
            </div>

            <p
              v-if="errorMessage"
              class="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {{ errorMessage }}
            </p>

            <p
              v-if="successMessage"
              class="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            >
              {{ successMessage }}
            </p>

            <UiButton
              type="submit"
              :disabled="loading"
              class="h-12 w-full rounded-2xl text-sm font-semibold shadow-[0_14px_30px_rgba(229,146,165,0.28)]"
            >
              {{ loading ? '로그인 중...' : '로그인' }}
              <ArrowRight class="h-4 w-4" />
            </UiButton>
          </form>

          <div class="rounded-[1.5rem] bg-secondary/70 px-4 py-3 text-sm text-muted-foreground">
            로그인 후 대시보드, 거래 내역, 캘린더 가계부 화면으로 이어집니다.
          </div>

          <button
            type="button"
            class="text-sm font-medium text-primary underline-offset-4 transition hover:underline"
            @click="router.push({ name: 'signup' })"
          >
            아이디 만들기
          </button>
        </div>
      </UiCard>
    </div>
  </div>
</template>

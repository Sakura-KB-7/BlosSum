<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import UiCard from '@/components/ui/UiCard.vue';
import UiButton from '@/components/ui/UiButton.vue';
import { useProfileStore } from '@/stores/profile';

const profile = useProfileStore();

const name = ref('');
const email = ref('');
const saving = ref(false);

onMounted(async () => {
  await profile.fetchAll();
});

watch(
  () => profile.profile,
  (p) => {
    name.value = p?.name ?? '';
    email.value = p?.email ?? '';
  },
  { immediate: true }
);

async function onSave() {
  saving.value = true;
  try {
    await profile.save({ name: name.value, email: email.value });
    alert('저장되었습니다.');
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-foreground">설정 · 프로필</h1>
      <p class="text-muted-foreground">이름·이메일을 수정할 수 있습니다.</p>
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
        <UiButton type="submit" class="w-fit" :disabled="saving || profile.loading">
          {{ saving ? '저장 중…' : '저장' }}
        </UiButton>
      </form>
    </UiCard>
  </div>
</template>

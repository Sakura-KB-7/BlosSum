<script setup>
import UiButton from '@/shared/ui/UiButton.vue';
import UiCard from '@/shared/ui/UiCard.vue';

defineProps({
  draftPlace: {
    type: Object,
    default: null,
  },
  categories: {
    type: Array,
    default: () => [],
  },
  savingPlaceId: {
    type: [String, Number, null],
    default: null,
  },
  addressText: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['save', 'cancel']);
</script>

<template>
  <div v-if="draftPlace" class="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
    <UiCard class="border-none bg-card/80 shadow-sm backdrop-blur-sm lg:col-span-2">
      <div class="p-6 pb-2">
        <!-- 아직 저장되지 않은 임시 핀 정보를 메모/카테고리와 함께 다듬는 폼 -->
        <h2 class="text-lg font-semibold">지도로 직접 추가한 핀</h2>
      </div>
      <div class="grid gap-4 px-6 pb-6 md:grid-cols-2">
        <label class="space-y-2">
          <span class="text-sm font-medium text-foreground">장소 이름</span>
          <input
            v-model="draftPlace.placeName"
            type="text"
            placeholder="예: 한강 산책 코스"
            class="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </label>
        <label class="space-y-2">
          <span class="text-sm font-medium text-foreground">카테고리</span>
          <select
            v-model="draftPlace.category"
            class="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
          >
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </label>
        <label class="space-y-2 md:col-span-2">
          <span class="text-sm font-medium text-foreground">메모</span>
          <textarea
            v-model="draftPlace.memo"
            rows="3"
            placeholder="왜 저장했는지, 누구와 갈 곳인지 등을 적어두세요."
            class="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </label>
        <div class="rounded-2xl bg-secondary/60 px-4 py-3 text-sm text-muted-foreground md:col-span-2">
          {{ addressText }}
        </div>
        <!-- 저장하기 전까지는 이 draft 상태만 바뀌고 db.json에는 반영되지 않는다. -->
        <div class="flex gap-3 md:col-span-2">
          <UiButton
            class="rounded-2xl"
            :disabled="savingPlaceId === draftPlace.id"
            @click="emit('save')"
          >
            {{ savingPlaceId === draftPlace.id ? '저장 중...' : '이 핀 저장하기' }}
          </UiButton>
          <UiButton variant="outline" class="rounded-2xl" @click="emit('cancel')">취소</UiButton>
        </div>
      </div>
    </UiCard>
  </div>
</template>

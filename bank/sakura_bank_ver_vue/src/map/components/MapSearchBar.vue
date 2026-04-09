<script setup>
import { Search } from 'lucide-vue-next';
import UiButton from '@/shared/ui/UiButton.vue';
import UiCard from '@/shared/ui/UiCard.vue';

defineProps({
  keyword: {
    type: String,
    default: '',
  },
  searching: {
    type: Boolean,
    default: false,
  },
  loadingMap: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:keyword', 'search']);
</script>

<template>
  <UiCard class="border-none bg-card/80 shadow-sm backdrop-blur-sm">
    <div class="flex flex-col gap-3 p-4 md:flex-row">
      <!-- 입력값은 부모가 들고 있으므로 update 이벤트로만 전달한다. -->
      <label class="flex-1">
        <span class="sr-only">장소 검색</span>
        <div class="flex items-center gap-2 rounded-2xl border border-input bg-background px-4">
          <Search class="h-4 w-4 text-muted-foreground" />
          <input
            :value="keyword"
            type="text"
            placeholder="예: 성수동 카페, 경복궁, 한강공원"
            class="h-12 w-full bg-transparent text-sm outline-none"
            @input="emit('update:keyword', $event.target.value)"
            @keydown.enter.prevent="emit('search')"
          />
        </div>
      </label>
      <!-- 지도 준비 전이나 검색 중에는 중복 요청을 막기 위해 버튼을 비활성화한다. -->
      <UiButton
        class="h-12 rounded-2xl px-6"
        :disabled="searching || loadingMap"
        @click="emit('search')"
      >
        {{ searching ? '검색 중...' : '장소 검색' }}
      </UiButton>
    </div>
  </UiCard>
</template>

<script setup>
import { ExternalLink, MapPin, Pencil, Trash2 } from 'lucide-vue-next';
import UiButton from '@/shared/ui/UiButton.vue';
import UiCard from '@/shared/ui/UiCard.vue';

defineProps({
  places: {
    type: Array,
    default: () => [],
  },
  selectedPlaceId: {
    type: [String, Number, null],
    default: null,
  },
  editingPlaceId: {
    type: [String, Number, null],
    default: null,
  },
  deletingPlaceId: {
    type: [String, Number, null],
    default: null,
  },
  editForm: {
    type: Object,
    default: () => ({
      placeName: '',
      category: '기타',
      memo: '',
    }),
  },
  categories: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  'focus-place',
  'start-edit',
  'remove-place',
  'save-edit',
  'cancel-edit',
]);
</script>

<template>
  <UiCard class="h-[280px] border-none bg-card/80 shadow-sm backdrop-blur-sm">
    <div class="p-5 pb-2">
      <h2 class="text-lg font-semibold">내가 저장한 장소</h2>
    </div>
    <div class="h-[208px] space-y-3 overflow-y-auto px-5 pb-5">
      <!-- 장소가 많아질 때도 카드 높이가 늘어나지 않도록 목록 내부만 스크롤한다. -->
      <div
        v-if="places.length === 0"
        class="rounded-2xl bg-secondary/60 px-4 py-6 text-center text-sm text-muted-foreground"
      >
        아직 저장한 장소가 없습니다.
      </div>
      <div
        v-for="place in places"
        :key="place.id"
        class="rounded-2xl border p-4 transition"
        :class="
          selectedPlaceId === place.id ? 'border-primary bg-primary/5' : 'border-border bg-background/80'
        "
      >
        <div class="flex items-start justify-between gap-3">
          <!-- 카드 본문 클릭은 해당 저장 장소를 지도 중심으로 가져오는 액션이다. -->
          <button type="button" class="min-w-0 text-left" @click="emit('focus-place', place)">
            <div class="flex items-center gap-2">
              <MapPin class="h-4 w-4 shrink-0 text-primary" />
              <p class="truncate font-semibold text-foreground">{{ place.placeName }}</p>
            </div>
            <p class="mt-1 text-xs font-medium text-primary/80">{{ place.category || '기타' }}</p>
            <p class="mt-1 text-sm text-muted-foreground">
              {{ place.roadAddressName || place.addressName || '주소 정보 없음' }}
            </p>
            <p v-if="place.memo" class="mt-2 text-sm text-foreground/80">{{ place.memo }}</p>
          </button>
          <div class="flex items-center gap-2">
            <!-- 수정, 외부 링크, 삭제를 각각 분리된 액션 버튼으로 둔다. -->
            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white/80 text-muted-foreground transition hover:text-foreground"
              @click="emit('start-edit', place)"
            >
              <Pencil class="h-4 w-4" />
            </button>
            <a
              v-if="place.placeUrl"
              :href="place.placeUrl"
              target="_blank"
              rel="noreferrer"
              class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white/80 text-muted-foreground transition hover:text-foreground"
            >
              <ExternalLink class="h-4 w-4" />
            </a>
            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white/80 text-muted-foreground transition hover:text-destructive"
              :disabled="deletingPlaceId === place.id"
              @click="emit('remove-place', place)"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
        <!-- 현재 수정 중인 카드에만 인라인 편집 폼을 펼친다. -->
        <div v-if="editingPlaceId === place.id" class="mt-4 space-y-3 rounded-2xl bg-secondary/60 p-4">
          <label class="block space-y-2">
            <span class="text-xs font-medium text-foreground">장소 이름</span>
            <input
              v-model="editForm.placeName"
              type="text"
              class="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </label>
          <label class="block space-y-2">
            <span class="text-xs font-medium text-foreground">카테고리</span>
            <select
              v-model="editForm.category"
              class="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            >
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </label>
          <label class="block space-y-2">
            <span class="text-xs font-medium text-foreground">메모</span>
            <textarea
              v-model="editForm.memo"
              rows="3"
              class="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </label>
          <div class="flex gap-2">
            <UiButton size="sm" class="rounded-full" @click="emit('save-edit', place)">저장</UiButton>
            <UiButton size="sm" variant="outline" class="rounded-full" @click="emit('cancel-edit')">
              취소
            </UiButton>
          </div>
        </div>
      </div>
    </div>
  </UiCard>
</template>

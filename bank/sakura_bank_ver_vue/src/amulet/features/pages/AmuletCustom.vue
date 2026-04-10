<script setup>
import { reactive, ref, onMounted } from 'vue';
import { Download, RotateCcw, Trash2, Heart, Sparkles } from 'lucide-vue-next';
import UiCard from '@/shared/ui/UiCard.vue';
import { cn } from '@/shared/lib/utils';
import AmuletActionModal from '@/amulet/features/components/AmuletActionModal.vue';

// 부적 꾸미기 상태 관리
const charmConfig = reactive({
  colorTheme: 'pink',
  character: 'koala',
  frameStyle: 'dashed',
  title: '나의 지갑 속 작은 행운',
  message: '모든 일이\n벚꽃처럼 피어날 거예요.',
});

// 저장된 부적 목록
const savedCharms = ref([]);
const showSaveModal = ref(false);
const showDeleteModal = ref(false);
const deletingCharmId = ref(null);

// [추가] 페이지 로드 시 로컬 스토리지에서 부적 불러오기
onMounted(() => {
  const data = localStorage.getItem('my-saved-charms');
  if (data) {
    savedCharms.value = JSON.parse(data);
  }
});

const emojiMap = {
  koala: '🐨',
  dragon: '🐲',
  clover: '🍀',
  rabbit: '🐰',
  cat: '🐱',
  money: '💰',
  star: '⭐',
  heart: '💖',
  bird: '🕊️',
  moon: '🌙',
  sun: '☀️',
  peach: '🍑',
  dog: '🐶',
  fox: '🦊',
  owl: '🦉',
  unicorn: '🦄',
};

const themes = [
  { id: 'pink', color: '#F6C9DA', label: '벚꽃' },
  { id: 'gold', color: '#F4D58D', label: '황금' },
  { id: 'mint', color: '#B8E0D2', label: '풀잎' },
  { id: 'sky', color: '#B3D9F2', label: '하늘' },
  { id: 'purple', color: '#D6BCFA', label: '보라' },
  { id: 'peach', color: '#FFD1B3', label: '복숭아' },
  { id: 'midnight', color: '#334155', label: '밤하늘' },
  { id: 'lavender', color: '#E9D5FF', label: '라벤더' },
  { id: 'sunset', color: '#FB923C', label: '저녁노을' },
  { id: 'forest', color: '#166534', label: '깊은숲' },
  { id: 'ocean', color: '#0369A1', label: '깊은바다' },
  { id: 'berry', color: '#DB2777', label: '베리' },
];

const frames = [
  {
    id: 'dashed',
    label: '심플 점선',
    class: 'border-[3px] border-dashed border-black/20',
  },
  {
    id: 'double',
    label: '이중 라인',
    class: 'border-double border-[6px] border-black/15',
  },
  {
    id: 'wavy',
    label: '물결무늬',
    class: 'border-[10px]',
    style:
      "border-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2730%27 height=%2710%27 viewBox=%270 0 30 10%27%3E%3Cpath d=%27M0 5c5 0 5-5 10-5s5 5 10 5 5-5 10-5%27 stroke=%27%23000%27 stroke-opacity=%270.3%27 fill=%27none%27 stroke-width=%272%27/%3E%3C/svg%3E') 10 repeat;",
  },
  {
    id: 'zigZag',
    label: '지그재그',
    class: 'border-[12px]',
    style:
      "border-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2720%27 height=%2720%27 viewBox=%270 0 20 20%27%3E%3Cpolygon points=%2710,0 20,10 10,20 0,10%27 fill=%27%23000%27 fill-opacity=%270.2%27/%3E%3C/svg%3E') 10 repeat;",
  },
  {
    id: 'neon',
    label: '네온광',
    class:
      'border-[3px] border-pink-400 shadow-[0_0_15px_rgba(244,114,182,0.6)]',
  },
  {
    id: 'ornate',
    label: '화려한 액자',
    class: 'border-[12px] m-1',
    style:
      "border-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2740%27 height=%2740%27 viewBox=%270 0 40 40%27%3E%3Cpath d=%27M20 5l5 10h10l-8 7 3 10-10-6-10 6 3-10-8-7h10z%27 fill=%27%23000%27 fill-opacity=%270.25%27/%3E%3C/svg%3E') 15 repeat;",
  },
  {
    id: 'traditional',
    label: '전통 문양',
    class: 'border-[12px] m-1',
    style:
      "border-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2720%27 height=%2720%27 viewBox=%270 0 20 20%27%3E%3Cpath d=%27M10 0v20M0 10h20M5 5l10 10M5 15L15 5%27 stroke=%27%23000%27 stroke-opacity=%270.4%27 fill=%27none%27 stroke-width=%272%27/%3E%3C/svg%3E') 10 repeat;",
  },
  {
    id: 'sparkle',
    label: '반짝이',
    class:
      'border-[5px] border-dotted border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]',
  },
];

// [수정] 저장 시 로컬 스토리지에 기록
const handleSave = () => {
  const newCharm = {
    id: Date.now(),
    ...JSON.parse(JSON.stringify(charmConfig)),
    date: new Date().toLocaleDateString(),
  };
  savedCharms.value.unshift(newCharm);

  // 브라우저 저장소에 동기화
  localStorage.setItem('my-saved-charms', JSON.stringify(savedCharms.value));
  showSaveModal.value = true;
};

function requestDeleteCharm(id) {
  deletingCharmId.value = id;
  showDeleteModal.value = true;
}

function closeSaveModal() {
  showSaveModal.value = false;
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  deletingCharmId.value = null;
}

// [수정] 삭제 시 로컬 스토리지에서도 제거
function confirmDeleteCharm() {
  if (!deletingCharmId.value) return;
  savedCharms.value = savedCharms.value.filter(
    (c) => c.id !== deletingCharmId.value,
  );
  localStorage.setItem('my-saved-charms', JSON.stringify(savedCharms.value));
  closeDeleteModal();
}

const resetConfig = () => {
  charmConfig.colorTheme = 'pink';
  charmConfig.character = 'koala';
  charmConfig.frameStyle = 'dashed';
  charmConfig.message = '모든 일이\n벚꽃처럼 피어날 거예요.';
};

const getThemeClass = (themeId) => {
  const maps = {
    pink: 'bg-gradient-to-br from-[#FFF0F6] to-[#FFE0EC] text-[#3C3028]',
    gold: 'bg-gradient-to-br from-[#FFFBF0] to-[#FFF5DC] text-[#3C3028]',
    mint: 'bg-gradient-to-br from-[#F0FFF8] to-[#DCFFF0] text-[#3C3028]',
    sky: 'bg-gradient-to-br from-[#F0F8FF] to-[#DDF0FF] text-[#3C3028]',
    purple: 'bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] text-[#3C3028]',
    peach: 'bg-gradient-to-br from-[#FFF5F1] to-[#FFE4D5] text-[#3C3028]',
    midnight: 'bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-white',
    lavender: 'bg-gradient-to-br from-[#F3E8FF] to-[#E9D5FF] text-[#3C3028]',
    sunset: 'bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] text-[#3C3028]',
    forest: 'bg-gradient-to-br from-[#D1FAE5] to-[#A7F3D0] text-[#166534]',
    ocean: 'bg-gradient-to-br from-[#E0F2FE] to-[#BAE6FD] text-[#0369A1]',
    berry: 'bg-gradient-to-br from-[#FCE7F3] to-[#FBCFE8] text-[#9D174D]',
  };
  return maps[themeId] || maps.pink;
};

const getAdjustedFrame = (frameId, themeId) => {
  const frame = frames.find((f) => f.id === frameId) || frames[0];
  let className = frame.class;
  let style = frame.style || '';
  const isDark = ['midnight', 'forest', 'ocean', 'berry'].includes(themeId);
  if (isDark) {
    className = className
      .replace(/black/g, 'white')
      .replace(/opacity-0.2/g, 'opacity-0.5');
    style = style.replace(/%23000/g, '%23FFF');
  }
  return { className, style };
};
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-foreground flex items-center gap-2">
        부적 꾸미기 🔮
      </h1>
      <p class="text-muted-foreground">
        행운의 심볼과 문구를 조합해 나만의 부적을 만드세요.
      </p>
    </div>

    <UiCard
      class="border-none bg-card/80 shadow-sm backdrop-blur-sm overflow-hidden"
    >
      <div
        class="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border min-h-[550px]"
      >
        <div class="flex-1 p-6 md:p-10 space-y-8 flex flex-col justify-between">
          <div class="space-y-8">
            <div class="flex justify-between items-center border-b pb-4">
              <h2
                class="text-base font-bold text-[#5C4A4E] flex items-center gap-2"
              >
                <span class="w-1 h-4 bg-[#E07A9B] rounded-full"></span> 부적
                커스터마이징
              </h2>
              <button
                @click="resetConfig"
                class="text-xs text-gray-400 hover:text-foreground flex items-center gap-1"
              >
                <RotateCcw class="h-3.5 w-3.5" /> 초기화
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section class="space-y-4">
                <p
                  class="text-[11px] font-bold text-[#BBA8AE] uppercase tracking-wider"
                >
                  Theme & Frame
                </p>
                <div class="grid grid-cols-6 gap-2">
                  <button
                    v-for="t in themes"
                    :key="t.id"
                    @click="charmConfig.colorTheme = t.id"
                    class="w-full aspect-square rounded-full border-2 transition-all shadow-sm"
                    :class="
                      charmConfig.colorTheme === t.id
                        ? 'border-[#E07A9B] scale-110 ring-2 ring-pink-50'
                        : 'border-background'
                    "
                    :style="{ backgroundColor: t.color }"
                  />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="f in frames"
                    :key="f.id"
                    @click="charmConfig.frameStyle = f.id"
                    :class="
                      cn(
                        'px-3 py-2 text-[11px] rounded-lg border transition-all',
                        charmConfig.frameStyle === f.id
                          ? 'bg-[#E07A9B] text-white border-[#E07A9B]'
                          : 'bg-secondary/40 border-transparent hover:bg-secondary',
                      )
                    "
                  >
                    {{ f.label }}
                  </button>
                </div>
              </section>

              <section class="space-y-4">
                <p
                  class="text-[11px] font-bold text-[#BBA8AE] uppercase tracking-wider"
                >
                  Lucky Symbol
                </p>
                <div class="grid grid-cols-4 gap-2">
                  <button
                    v-for="(emoji, id) in emojiMap"
                    :key="id"
                    @click="charmConfig.character = id"
                    :class="
                      cn(
                        'flex items-center justify-center aspect-square rounded-xl border transition-all text-xl',
                        charmConfig.character === id
                          ? 'border-pink-300 bg-pink-50 shadow-inner'
                          : 'border-secondary bg-secondary/30 hover:border-pink-200',
                      )
                    "
                  >
                    {{ emoji }}
                  </button>
                </div>
              </section>
            </div>

            <section class="space-y-3">
              <p
                class="text-[11px] font-bold text-[#BBA8AE] uppercase tracking-wider"
              >
                Your Message
              </p>
              <textarea
                v-model="charmConfig.message"
                class="w-full p-4 rounded-xl border border-secondary bg-secondary/20 focus:ring-2 focus:ring-pink-100 outline-none text-sm h-24 resize-none"
                placeholder="내용을 입력하세요..."
              />
            </section>
          </div>

          <div class="flex justify-center pt-4">
            <button
              @click="handleSave"
              class="w-fit px-12 py-4 bg-[#E07A9B] hover:bg-[#F0A8C2] text-white rounded-2xl font-bold text-sm shadow-xl shadow-pink-100 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Download class="h-4 w-4" /> 완성된 부적 보관하기
            </button>
          </div>
        </div>

        <div
          class="flex-1 p-8 flex flex-col items-center justify-center bg-secondary/5 relative min-h-[450px]"
        >
          <p
            class="absolute top-6 text-[10px] text-[#BBA8AE] tracking-[0.4em] font-black uppercase"
          >
            Live Preview
          </p>
          <div
            :class="
              cn(
                'amulet-preview relative w-[240px] h-[360px] rounded-[36px] shadow-2xl transition-all duration-700 flex flex-col items-center justify-center p-8 text-center border-[4px] border-white overflow-hidden',
                getThemeClass(charmConfig.colorTheme),
              )
            "
          >
            <div
              :class="
                cn(
                  'absolute inset-3 rounded-[28px] pointer-events-none',
                  getAdjustedFrame(
                    charmConfig.frameStyle,
                    charmConfig.colorTheme,
                  ).className,
                )
              "
              :style="
                getAdjustedFrame(charmConfig.frameStyle, charmConfig.colorTheme)
                  .style
              "
            />
            <div class="z-10 flex flex-col items-center gap-6">
              <h2
                class="text-xl font-bold break-keep leading-relaxed italic font-serif"
              >
                "{{ charmConfig.message }}"
              </h2>
              <div
                class="text-7xl py-2 animate-bounce-slow filter drop-shadow-xl"
              >
                {{ emojiMap[charmConfig.character] }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </UiCard>

    <UiCard
      class="border-none bg-card/80 shadow-sm backdrop-blur-sm p-8 md:p-10"
    >
      <div class="flex items-center gap-2 mb-10 border-b pb-6">
        <Heart class="h-5 w-5 text-[#E07A9B] fill-[#E07A9B]" />
        <h2 class="text-[15px] font-bold text-[#333]">부적 보관함</h2>
        <span
          class="text-xs bg-gray-100 text-[#BBA8AE] px-3 py-1 rounded-full ml-auto font-medium"
          >{{ savedCharms.length }}개의 부적</span
        >
      </div>

      <div
        v-if="savedCharms.length === 0"
        class="flex flex-col items-center justify-center py-32 text-gray-300 italic text-xs"
      >
        저장된 부적이 없습니다.
      </div>

      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-8 px-2"
      >
        <div
          v-for="charm in savedCharms"
          :key="charm.id"
          class="group relative transition-all hover:-translate-y-2"
        >
          <div
            :class="
              cn(
                'relative w-full aspect-[2/3] rounded-[24px] shadow-md border-[2px] border-white flex flex-col items-center justify-center p-6 text-center overflow-hidden transition-all duration-500',
                getThemeClass(charm.colorTheme),
              )
            "
          >
            <div
              :class="
                cn(
                  'absolute inset-2 rounded-[18px] pointer-events-none',
                  getAdjustedFrame(charm.frameStyle, charm.colorTheme)
                    .className,
                )
              "
              :style="
                getAdjustedFrame(charm.frameStyle, charm.colorTheme).style
              "
            />
            <div
              class="z-10 flex flex-col items-center gap-3 scale-[0.6] transform-gpu"
            >
              <h2
                class="text-lg font-bold break-keep leading-tight italic font-serif"
              >
                "{{ charm.message }}"
              </h2>
              <span class="text-6xl filter drop-shadow-sm">{{
                emojiMap[charm.character]
              }}</span>
            </div>
            <button
              @click="requestDeleteCharm(charm.id)"
              class="absolute top-1 right-1 p-1 bg-white/90 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white shadow-sm z-20"
            >
              <Trash2 class="h-3 w-3" />
            </button>
          </div>
          <p
            class="mt-3 text-[10px] text-center text-[#BBA8AE] font-medium tracking-tighter"
          >
            {{ charm.date }}
          </p>
        </div>
      </div>
    </UiCard>

    <AmuletActionModal
      :open="showSaveModal"
      title="행운이 보관함에 저장되었습니다!"
      description="방금 만든 부적이 보관함에 잘 담겼어요. 필요할 때 언제든 다시 꺼내볼 수 있습니다."
      confirm-text="확인"
      :show-cancel="false"
      icon="sparkles"
      @close="closeSaveModal"
      @confirm="closeSaveModal"
    />

    <AmuletActionModal
      :open="showDeleteModal"
      title="이 부적을 삭제하시겠습니까?"
      description="보관함에서 삭제하면 다시 되돌릴 수 없습니다. 정말 이 부적을 지울까요?"
      confirm-text="삭제하기"
      cancel-text="취소"
      confirm-tone="danger"
      icon="trash"
      @close="closeDeleteModal"
      @confirm="confirmDeleteCharm"
    />
  </div>
</template>

<style scoped>
@keyframes bounce-slow {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}
.animate-bounce-slow {
  animation: bounce-slow 3s ease-in-out infinite;
}
.font-serif {
  font-family: 'Noto Serif KR', serif;
}
h2 {
  white-space: pre-line;
}
</style>

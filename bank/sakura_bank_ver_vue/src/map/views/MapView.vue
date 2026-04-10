<script setup>
import { computed, onMounted, ref } from 'vue';
import { loadNaverMapsSdk } from '@/map/lib/naver-map';
import MapCanvasCard from '@/map/components/MapCanvasCard.vue';
import MapDraftPlaceCard from '@/map/components/MapDraftPlaceCard.vue';
import MapSavedPlacesCard from '@/map/components/MapSavedPlacesCard.vue';
import MapSearchBar from '@/map/components/MapSearchBar.vue';
import MapSearchResultsCard from '@/map/components/MapSearchResultsCard.vue';
import MapSummaryCards from '@/map/components/MapSummaryCards.vue';
import { useMapLocation } from '@/map/composables/useMapLocation';
import { useMapPlaces } from '@/map/composables/useMapPlaces';
import { useMapSearch } from '@/map/composables/useMapSearch';
import { createMapScene } from '@/map/lib/naver-map-scene';
import { PLACE_CATEGORIES } from '@/map/lib/place-utils';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();

const mapError = ref('');
const loadingMap = ref(true);
const mapRef = ref(null);
const hasMapKey = computed(() =>
  Boolean(import.meta.env.VITE_NAVER_MAP_CLIENT_ID),
);

// 지도 SDK에서 올라오는 이벤트를 Vue 상태 변경 함수와 연결한다.
const mapScene = createMapScene({
  onMapClick: async ({ lat, lng }) => {
    await mapPlaces.createDraftFromCoords(lat, lng);
  },
  onSavedPlaceSelect: (place) => {
    mapPlaces.selectedPlaceId.value = place.id;
  },
});

const mapPlaces = useMapPlaces({ auth, mapScene });
const mapLocation = useMapLocation({ mapScene });
const mapSearch = useMapSearch({
  mapScene,
  getReferencePosition,
  userAddressTokens: mapLocation.userAddressTokens,
});

// 검색 정렬 기준은 "현재 위치"가 있으면 그 좌표를, 없으면 "현재 지도 중심"을 쓴다.
function getReferencePosition() {
  if (mapLocation.userPosition.value) return mapLocation.userPosition.value;
  return mapScene.getCenter();
}

// 페이지 진입 시 지도 SDK, 현재 위치, 저장 장소 목록을 순서대로 준비한다.
async function initializeMap() {
  loadingMap.value = true;
  mapError.value = '';

  try {
    await loadNaverMapsSdk();
    if (!mapRef.value?.mapContainer) return;

    mapScene.initialize(mapRef.value.mapContainer);

    try {
      await mapLocation.loadInitialLocation();
    } catch (error) {}

    await mapPlaces.refreshFavoritePlaces();
    mapScene.renderSavedMarkers(mapPlaces.sortedFavoritePlaces.value);

    if (mapPlaces.favoritePlaces.value.length > 0) {
      const first = mapPlaces.favoritePlaces.value[0];
      mapScene.setCenter(first.lat, first.lng);
    }
  } catch (error) {
    mapError.value =
      '네이버 지도를 불러오지 못했습니다. `.env`에 `VITE_NAVER_MAP_CLIENT_ID`가 있는지 확인하세요.';
  } finally {
    loadingMap.value = false;
  }
}

function moveToCurrentLocation() {
  mapLocation.moveToCurrentLocation();
}

onMounted(async () => {
  if (!hasMapKey.value) {
    loadingMap.value = false;
    mapError.value =
      '네이버 지도 API 키가 없습니다. `.env`에 `VITE_NAVER_MAP_CLIENT_ID`를 추가하세요.';
    return;
  }

  await initializeMap();
});
</script>

<template>
  <div class="space-y-6">
    <!-- 이 화면이 어떤 기능을 제공하는지 먼저 설명하는 헤더 영역 -->
    <div>
      <div>
        <h1 class="text-2xl font-bold text-foreground">나의 소비지도 🗺️</h1>
        <p class="text-muted-foreground">
          자주 방문하는 장소와 지역별 지출 분포를 한눈에 확인해보세요 📍
        </p>
      </div>
    </div>

    <MapSearchBar
      v-model:keyword="mapSearch.keyword.value"
      :searching="mapSearch.searching.value"
      :loading-map="loadingMap"
      @search="mapSearch.onSearch"
    />

    <!-- 실제 지도 캔버스와 현재 위치 버튼을 렌더링하는 영역 -->
    <MapCanvasCard
      ref="mapRef"
      :map-error="mapError"
      :locating="mapLocation.locating.value"
      @move-current-location="moveToCurrentLocation"
    />

    <!-- 저장 개수와 최근 저장 장소를 빠르게 볼 수 있는 요약 카드 -->
    <MapSummaryCards
      :loading="loadingMap"
      :total-places="mapPlaces.totalPlaces.value"
      :category-counts="mapPlaces.categoryCounts.value"
      :recent-saved-places="mapPlaces.recentSavedPlaces.value"
      @focus-place="mapPlaces.focusPlace"
    />

    <!-- 지도 클릭이나 검색 결과 선택 후 저장 전에 한 번 더 편집하는 draft 폼 -->
    <MapDraftPlaceCard
      :draft-place="mapPlaces.draftPlace.value"
      :categories="PLACE_CATEGORIES"
      :saving-place-id="mapPlaces.savingPlaceId.value"
      :address-text="mapPlaces.draftAddressText.value"
      @save="mapPlaces.saveDraftPlace"
      @cancel="mapPlaces.cancelDraftPlace"
    />

    <div class="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <!-- 왼쪽은 검색 결과, 오른쪽은 실제로 저장된 내 장소 목록 -->
      <MapSearchResultsCard
        :loading-map="loadingMap"
        :search-results="mapSearch.searchResults.value"
        :saving-place-id="mapPlaces.savingPlaceId.value"
        @focus-result="mapSearch.focusSearchResult"
        @save-place="mapPlaces.saveSearchPlace"
      />

      <MapSavedPlacesCard
        :places="mapPlaces.favoritePlaces.value"
        :selected-place-id="mapPlaces.selectedPlaceId.value"
        :editing-place-id="mapPlaces.editingPlaceId.value"
        :deleting-place-id="mapPlaces.deletingPlaceId.value"
        :edit-form="mapPlaces.editForm.value"
        :categories="PLACE_CATEGORIES"
        @focus-place="mapPlaces.focusPlace"
        @start-edit="mapPlaces.startEditingPlace"
        @remove-place="mapPlaces.removePlace"
        @save-edit="mapPlaces.saveEditedPlace"
        @cancel-edit="mapPlaces.cancelEditingPlace"
      />
    </div>
  </div>
</template>

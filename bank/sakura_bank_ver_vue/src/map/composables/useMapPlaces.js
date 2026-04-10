import { computed, ref } from 'vue';
import {
  createFavoritePlace,
  deleteFavoritePlace,
  fetchFavoritePlaces,
  updateFavoritePlace,
} from '@/map/lib/place-api';
import { normalizeDraftAddress, sortFavoritePlaces } from '@/map/lib/place-utils';
import { reverseGeocode } from '@/map/lib/naver-map-service';

// 저장 장소 목록, 임시 핀, 수정 상태를 한곳에서 관리한다.
export function useMapPlaces({ auth, mapScene }) {
  const favoritePlaces = ref([]);
  const selectedPlaceId = ref(null);
  const draftPlace = ref(null);
  const editingPlaceId = ref(null);
  const savingPlaceId = ref(null);
  const deletingPlaceId = ref(null);
  const editForm = ref({
    placeName: '',
    category: '기타',
    memo: '',
  });

  const sortedFavoritePlaces = computed(() => sortFavoritePlaces(favoritePlaces.value));
  const totalPlaces = computed(() => sortedFavoritePlaces.value.length);
  const recentSavedPlaces = computed(() => sortedFavoritePlaces.value.slice(0, 2));
  const categoryCounts = computed(() => {
    const counts = sortedFavoritePlaces.value.reduce((acc, place) => {
      const category = place.category || '기타';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }));
  });

  // draft가 잡혀 있을 때만 폼 하단에 보여줄 대표 주소 문구를 만든다.
  const draftAddressText = computed(() => {
    if (!draftPlace.value) return '';
    return normalizeDraftAddress(draftPlace.value.roadAddressName, draftPlace.value.addressName);
  });

  // 현재 로그인 사용자의 저장 장소를 다시 읽어온다.
  async function refreshFavoritePlaces() {
    favoritePlaces.value = await fetchFavoritePlaces(auth.currentUserId);
  }

  // 지도 클릭 좌표를 임시 저장 폼용 draft 데이터로 바꾼다.
  async function createDraftFromCoords(lat, lng) {
    const result = await reverseGeocode(lat, lng);

    // 지도 클릭은 이름이 없으므로 주소만 채운 빈 draft부터 만든다.
    draftPlace.value = {
      id: 'draft',
      placeName: '',
      roadAddressName: result.roadAddressName,
      addressName: result.addressName,
      lat: Number(lat),
      lng: Number(lng),
      placeUrl: '',
      memo: '',
      category: '기타',
    };

    mapScene.renderDraftMarker(draftPlace.value);
  }

  // 검색 결과를 메모/카테고리 입력 가능한 draft로 바꾼다.
  function createDraftFromSearch(place) {
    // 검색 결과는 이름/주소가 이미 있으니 draft에 그대로 복사해 편집만 받는다.
    draftPlace.value = {
      id: place.id || 'draft',
      placeName: place.placeName || '',
      roadAddressName: place.roadAddressName || '',
      addressName: place.addressName || '',
      lat: Number(place.lat),
      lng: Number(place.lng),
      placeUrl: place.placeUrl || '',
      memo: '',
      category: '기타',
    };

    mapScene.renderDraftMarker(draftPlace.value);
    mapScene.panTo(place.lat, place.lng, 16);
  }

  // 실제 저장 요청을 보내고 성공 시 목록과 마커를 갱신한다.
  async function savePlace(place) {
    savingPlaceId.value = place.id || 'draft';

    try {
      const existingPlaces = await fetchFavoritePlaces(auth.currentUserId);

      // 같은 좌표를 중복 저장하지 않게 가장 단순한 기준으로 먼저 막는다.
      if (
        Array.isArray(existingPlaces) &&
        existingPlaces.some(
          (item) =>
            Number(item.lat) === Number(place.lat) && Number(item.lng) === Number(place.lng)
        )
      ) {
        return;
      }

      const data = await createFavoritePlace(auth.currentUserId, place);
      favoritePlaces.value = [data, ...favoritePlaces.value];
      // 전체 마커를 다시 그리지 않고 새로 저장된 핀만 추가해 UX를 부드럽게 유지한다.
      mapScene.addSavedMarker(data);
      draftPlace.value = null;
      mapScene.clearDraftMarker();
    } finally {
      savingPlaceId.value = null;
    }
  }

  // 현재 draft 상태를 검증한 뒤 저장한다.
  async function saveDraftPlace() {
    // draft는 장소 이름이 있어야만 실제 저장으로 넘긴다.
    if (!draftPlace.value || !draftPlace.value.placeName.trim()) return;

    await savePlace({
      ...draftPlace.value,
      placeName: draftPlace.value.placeName.trim(),
      memo: draftPlace.value.memo.trim(),
    });
  }

  // 검색 결과 저장 버튼은 곧바로 저장하지 않고 draft 편집으로 넘긴다.
  function saveSearchPlace(place) {
    createDraftFromSearch(place);
  }

  // 임시 핀 입력을 취소하고 draft 상태를 비운다.
  function cancelDraftPlace() {
    draftPlace.value = null;
    mapScene.clearDraftMarker();
  }

  // 저장된 장소를 삭제하고 목록/마커를 다시 맞춘다.
  async function removePlace(place) {
    deletingPlaceId.value = place.id;
    try {
      await deleteFavoritePlace(place.id);
      if (selectedPlaceId.value === place.id) {
        selectedPlaceId.value = null;
      }
      favoritePlaces.value = favoritePlaces.value.filter((item) => item.id !== place.id);
      // 삭제는 마커 배열이 틀어질 수 있어 현재 로컬 목록 기준으로 저장 마커를 다시 맞춘다.
      mapScene.renderSavedMarkers(sortedFavoritePlaces.value);
    } finally {
      deletingPlaceId.value = null;
    }
  }

  // 목록에서 선택한 장소를 지도 중심으로 이동시킨다.
  function focusPlace(place) {
    selectedPlaceId.value = place.id;
    mapScene.panTo(place.lat, place.lng, 16);
  }

  // 수정 폼을 열기 전에 현재 값을 편집 상태로 복사한다.
  function startEditingPlace(place) {
    editingPlaceId.value = place.id;
    editForm.value = {
      placeName: place.placeName || '',
      category: place.category || '기타',
      memo: place.memo || '',
    };
  }

  // 인라인 수정 상태만 닫는다.
  function cancelEditingPlace() {
    editingPlaceId.value = null;
  }

  // 수정된 장소 정보를 저장하고 목록과 마커를 갱신한다.
  async function saveEditedPlace(place) {
    const trimmedName = editForm.value.placeName.trim();
    if (!trimmedName) return;

    // 기존 place에 편집값만 덮어쓴 뒤 한 번에 PUT 요청으로 보낸다.
    const data = await updateFavoritePlace({
      ...place,
      placeName: trimmedName,
      category: editForm.value.category || '기타',
      memo: editForm.value.memo.trim(),
      createdAt: place.createdAt || new Date().toISOString(),
    });

    favoritePlaces.value = favoritePlaces.value.map((item) => (item.id === place.id ? data : item));
    mapScene.renderSavedMarkers(sortedFavoritePlaces.value);
    editingPlaceId.value = null;
  }

  return {
    favoritePlaces,
    selectedPlaceId,
    draftPlace,
    editingPlaceId,
    savingPlaceId,
    deletingPlaceId,
    editForm,
    totalPlaces,
    categoryCounts,
    recentSavedPlaces,
    draftAddressText,
    sortedFavoritePlaces,
    refreshFavoritePlaces,
    createDraftFromCoords,
    saveSearchPlace,
    saveDraftPlace,
    cancelDraftPlace,
    removePlace,
    focusPlace,
    startEditingPlace,
    cancelEditingPlace,
    saveEditedPlace,
  };
}

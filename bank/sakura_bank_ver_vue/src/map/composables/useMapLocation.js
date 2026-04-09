import { ref } from 'vue';
import { getAddressTokens } from '@/map/lib/place-utils';
import { getCurrentPosition, reverseGeocode } from '@/map/lib/naver-map-service';

// 현재 위치 관련 상태와 이동 액션을 관리한다.
export function useMapLocation({ mapScene }) {
  const userPosition = ref(null);
  const userAddressTokens = ref([]);
  const locating = ref(false);

  // 위치 좌표와 주소 토큰을 함께 갱신한다.
  async function syncUserLocation(position) {
    userPosition.value = position;
    mapScene.renderUserMarker(position);
    const geocodedPosition = await reverseGeocode(position.lat, position.lng);
    // 검색 결과를 "내 주변"에 더 가깝게 정렬하기 위해 주소 토큰도 함께 보관한다.
    userAddressTokens.value = getAddressTokens(geocodedPosition);
  }

  // 첫 진입 시 현재 위치를 한 번 읽어온다.
  async function loadInitialLocation() {
    const position = await getCurrentPosition();
    await syncUserLocation(position);
  }

  // 버튼 클릭으로 현재 위치로 이동하고 마커를 갱신한다.
  function moveToCurrentLocation(onError) {
    locating.value = true;

    getCurrentPosition()
      .then(async (position) => {
        await syncUserLocation(position);
        mapScene.panTo(position.lat, position.lng, 16);
      })
      .catch(() => {
        if (onError) onError();
      })
      .finally(() => {
        locating.value = false;
      });
  }

  return {
    locating,
    userPosition,
    userAddressTokens,
    loadInitialLocation,
    moveToCurrentLocation,
  };
}

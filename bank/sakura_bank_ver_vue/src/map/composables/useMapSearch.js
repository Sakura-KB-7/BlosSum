import { ref } from 'vue';
import { searchLocalPlaces } from '@/map/lib/place-api';
import { rankSearchResults, stripHtml } from '@/map/lib/place-utils';
import { geocodeAddress } from '@/map/lib/naver-map-service';

// 검색어 상태와 검색 실행 흐름을 관리한다.
export function useMapSearch({ mapScene, getReferencePosition, userAddressTokens }) {
  const keyword = ref('');
  const searching = ref(false);
  const searchResults = ref([]);

  // 네이버 검색 결과를 좌표화하고 정렬해 지도와 목록에 반영한다.
  async function onSearch(onError) {
    // 빈 검색어는 호출 자체를 생략한다.
    if (!keyword.value.trim()) return;
    // geocode를 쓰려면 네이버 지도 SDK가 먼저 올라와 있어야 한다.
    if (!window.naver?.maps?.Service) return;

    searching.value = true;
    try {
      const items = await searchLocalPlaces(keyword.value.trim());
      const geocoded = await Promise.all(
        items.map((item) => {
          // 지역 검색 API 응답은 HTML 태그가 섞일 수 있어서 먼저 정리한다.
          const title = stripHtml(item.title) || keyword.value.trim();
          const address = item.roadAddress || item.address || title;
          return geocodeAddress(address, title, item.link || '');
        })
      );

      // 결과 목록은 이름 유사도 + 현재 위치 보정을 함께 반영해 정렬한다.
      searchResults.value = rankSearchResults(
        geocoded,
        keyword.value.trim(),
        getReferencePosition(),
        userAddressTokens.value
      );
      // 검색 결과는 목록과 지도 마커, 지도 위치를 동시에 갱신한다.
      mapScene.renderSearchMarkers(searchResults.value);
      mapScene.fitToPlaces(searchResults.value);
    } catch (error) {
      searchResults.value = [];
      if (onError) onError(error);
    } finally {
      searching.value = false;
    }
  }

  // 검색 결과 카드 클릭 시 해당 좌표로 지도를 이동한다.
  function focusSearchResult(place) {
    mapScene.panTo(place.lat, place.lng, 16);
  }

  return {
    keyword,
    searching,
    searchResults,
    onSearch,
    focusSearchResult,
  };
}

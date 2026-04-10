import { http } from '@/api/http';

// 현재 로그인 사용자의 저장 장소 목록을 가져온다.
export async function fetchFavoritePlaces(userId) {
  const { data } = await http.get('/favoritePlaces', {
    params: { userId },
  });

  return Array.isArray(data) ? data : [];
}

// 검색 프록시 서버를 통해 네이버 지역 검색 결과를 가져온다.
export async function searchLocalPlaces(query) {
  const response = await fetch(`/api/search/local?query=${encodeURIComponent(query)}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || 'local search failed');
  }

  return Array.isArray(data.items) ? data.items : [];
}

// 새 저장 장소를 json-server에 추가한다.
export async function createFavoritePlace(userId, place) {
  const { data } = await http.post('/favoritePlaces', {
    userId,
    placeName: place.placeName || '새 장소',
    addressName: place.addressName || '',
    roadAddressName: place.roadAddressName || '',
    lat: Number(place.lat),
    lng: Number(place.lng),
    placeUrl: place.placeUrl || '',
    memo: place.memo || '',
    category: place.category || '기타',
    createdAt: new Date().toISOString(),
  });

  return data;
}

// 저장된 장소 정보를 수정한다.
export async function updateFavoritePlace(place) {
  const { data } = await http.put(`/favoritePlaces/${place.id}`, place);
  return data;
}

// 저장된 장소 하나를 삭제한다.
export async function deleteFavoritePlace(placeId) {
  await http.delete(`/favoritePlaces/${placeId}`);
}

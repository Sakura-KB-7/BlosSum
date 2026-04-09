export const PLACE_CATEGORIES = ['카페', '맛집', '산책', '쇼핑', '데이트', '기타'];

// 저장 폼에서 보여줄 대표 주소 문자열을 고른다.
export function normalizeDraftAddress(roadAddressName, addressName) {
  if (roadAddressName) return roadAddressName;
  if (addressName) return addressName;
  return '주소 정보를 찾지 못했습니다.';
}

// 네이버 검색 API의 HTML 강조 태그를 제거한다.
export function stripHtml(value) {
  return String(value || '').replace(/<[^>]*>/g, '').trim();
}

// 검색 비교를 위해 공백/대소문자를 정규화한다.
function normalizeText(value) {
  return String(value || '')
    .replace(/\s+/g, '')
    .toLowerCase()
    .trim();
}

// 현재 기준점과 장소 간 직선거리를 km 단위로 계산한다.
function distanceBetween(a, b) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(Number(b.lat) - Number(a.lat));
  const dLng = toRad(Number(b.lng) - Number(a.lng));
  const lat1 = toRad(Number(a.lat));
  const lat2 = toRad(Number(b.lat));

  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

// 이름, 주소, 현재 위치를 바탕으로 검색 결과 점수를 계산한다.
function scorePlace(place, query, referencePosition, userAddressTokens) {
  const normalizedQuery = normalizeText(query);
  const normalizedName = normalizeText(place.placeName);
  const normalizedRoad = normalizeText(place.roadAddressName);
  const normalizedAddress = normalizeText(place.addressName);
  const combinedAddress = `${normalizedRoad} ${normalizedAddress}`;

  let score = 0;
  let nameMatchTier = 0;

  if (normalizedName === normalizedQuery) {
    score += 1000;
    nameMatchTier = 3;
  }
  if (normalizedName.startsWith(normalizedQuery)) {
    score += 450;
    nameMatchTier = Math.max(nameMatchTier, 2);
  }
  if (normalizedName.includes(normalizedQuery)) {
    score += 280;
    nameMatchTier = Math.max(nameMatchTier, 1);
  }
  if (normalizedRoad.includes(normalizedQuery) || normalizedAddress.includes(normalizedQuery)) {
    score += 120;
  }

  userAddressTokens.forEach((token) => {
    const normalizedToken = normalizeText(token);
    if (normalizedToken && combinedAddress.includes(normalizedToken)) {
      score += 140;
    }
  });

  const distanceKm = distanceBetween(referencePosition, place);
  if (nameMatchTier >= 1) {
    score -= Math.min(distanceKm, 30) * 18;
  } else {
    score -= Math.min(distanceKm, 30) * 6;
  }

  return { ...place, distanceKm, score };
}

// 검색 결과를 점수순으로 정렬해 화면에 바로 쓸 수 있게 만든다.
export function rankSearchResults(places, query, referencePosition, userAddressTokens) {
  return places
    .filter(Boolean)
    .map((place) => scorePlace(place, query, referencePosition, userAddressTokens))
    .sort((a, b) => b.score - a.score || a.distanceKm - b.distanceKm);
}

// 저장 장소를 생성 시각 기준 최신순으로 정렬한다.
export function sortFavoritePlaces(places) {
  return [...places]
    .map((place) => ({
      ...place,
      category: place.category || '기타',
      createdAt: place.createdAt || '',
    }))
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (aTime !== bTime) return bTime - aTime;
      return Number(b.id || 0) - Number(a.id || 0);
    });
}

// 현재 위치 주소에서 검색 보정에 쓸 시/구/동 토큰을 추출한다.
export function getAddressTokens(result) {
  const tokens = new Set();

  [result?.roadAddressName, result?.addressName]
    .filter(Boolean)
    .forEach((address) => {
      address
        .split(' ')
        .map((part) => part.trim())
        .filter((part) => part.length >= 2)
        .forEach((part) => tokens.add(part));
    });

  return [...tokens];
}

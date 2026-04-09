import { createLatLng } from '@/map/lib/naver-map-service';

// 인포윈도우에 넣을 텍스트를 안전하게 이스케이프한다.
function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// 색상만 바꿔 재사용할 수 있는 핀 마커 HTML을 만든다.
function createMarkerIcon(color) {
  return {
    content: `
      <div style="
        position: relative;
        width: 22px;
        height: 22px;
        border-radius: 9999px 9999px 9999px 0;
        background: ${color};
        border: 3px solid #ffffff;
        transform: rotate(-45deg);
        box-shadow: 0 6px 16px rgba(15, 23, 42, 0.22);
      ">
        <div style="
          position: absolute;
          left: 50%;
          top: 50%;
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: #ffffff;
          transform: translate(-50%, -50%);
        "></div>
      </div>
    `,
    anchor: new window.naver.maps.Point(11, 22),
  };
}

// 네이버 지도 인스턴스와 마커/인포윈도우 렌더링을 관리한다.
export function createMapScene({ onMapClick, onSavedPlaceSelect }) {
  let naverMap = null;
  let infoWindow = null;
  let savedMarkers = [];
  let searchMarkers = [];
  let draftMarker = null;
  let userMarker = null;

  // 지정한 마커 목록을 지도에서 한 번에 제거한다.
  function clearMarkers(markers) {
    markers.forEach((marker) => marker.setMap(null));
    markers.length = 0;
  }

  // 마커 클릭 시 보이는 말풍선 내용을 연다.
  function openInfoWindow(marker, title, body) {
    if (!infoWindow) return;

    infoWindow.setContent(`
      <div style="padding:10px 12px;max-width:220px;">
        <div style="font-weight:600;margin-bottom:4px;">${escapeHtml(title)}</div>
        <div style="font-size:12px;color:#6b7280;line-height:1.4;">${escapeHtml(body)}</div>
      </div>
    `);
    infoWindow.open(naverMap, marker);
  }

  // 공통 마커 생성 로직을 한곳에 모은다.
  function createMarker(position, title, color) {
    return new window.naver.maps.Marker({
      position,
      map: naverMap,
      title,
      icon: createMarkerIcon(color),
    });
  }

  // 실제 네이버 지도 인스턴스를 만들고 지도 클릭 이벤트를 연결한다.
  function initialize(container) {
    naverMap = new window.naver.maps.Map(container, {
      center: createLatLng(37.5662952, 126.9779451),
      zoom: 14,
    });

    infoWindow = new window.naver.maps.InfoWindow({ borderWidth: 0 });

    window.naver.maps.Event.addListener(naverMap, 'click', async (event) => {
      // 지도 클릭 좌표를 그대로 부모 쪽 draft 생성 로직으로 넘긴다.
      if (!onMapClick) return;
      await onMapClick({ lat: event.coord.y, lng: event.coord.x });
    });
  }

  // 검색 정렬 시 기준이 되는 현재 지도 중심점을 반환한다.
  function getCenter() {
    if (!naverMap) return { lat: 37.5662952, lng: 126.9779451 };
    const center = naverMap.getCenter();
    return { lat: center.y, lng: center.x };
  }

  // 특정 좌표로 이동하면서 적당한 줌 레벨로 맞춘다.
  function panTo(lat, lng, zoom = 16) {
    if (!naverMap) return;
    naverMap.setZoom(zoom);
    naverMap.panTo(createLatLng(lat, lng));
  }

  // 초기 진입 시 중심 좌표만 조용히 바꿀 때 사용한다.
  function setCenter(lat, lng) {
    if (!naverMap) return;
    naverMap.setCenter(createLatLng(lat, lng));
  }

  // 검색 결과 첫 항목 기준으로 지도를 이동시킨다.
  function fitToPlaces(places) {
    if (!places.length) return;
    panTo(places[0].lat, places[0].lng, 16);
  }

  // 저장된 장소 마커들을 다시 그린다.
  function renderSavedMarkers(places) {
    clearMarkers(savedMarkers);

    places.forEach((place) => {
      const marker = createMarker(createLatLng(place.lat, place.lng), place.placeName, '#f472b6');

      window.naver.maps.Event.addListener(marker, 'click', () => {
        // 저장 마커 클릭 시 현재 선택 상태와 인포윈도우를 동시에 갱신한다.
        if (onSavedPlaceSelect) onSavedPlaceSelect(place);
        openInfoWindow(
          marker,
          place.placeName,
          `${place.category || '기타'} · ${place.memo || place.roadAddressName || place.addressName || ''}`
        );
      });

      savedMarkers.push(marker);
    });
  }

  // 방금 저장한 장소 마커만 추가해 전체 재렌더링을 줄인다.
  function addSavedMarker(place) {
    const marker = createMarker(createLatLng(place.lat, place.lng), place.placeName, '#f472b6');

    window.naver.maps.Event.addListener(marker, 'click', () => {
      if (onSavedPlaceSelect) onSavedPlaceSelect(place);
      openInfoWindow(
        marker,
        place.placeName,
        `${place.category || '기타'} · ${place.memo || place.roadAddressName || place.addressName || ''}`
      );
    });

    savedMarkers.push(marker);
  }

  // 검색 결과 마커를 파란 핀으로 다시 그린다.
  function renderSearchMarkers(places) {
    clearMarkers(searchMarkers);

    places.forEach((place) => {
      const marker = createMarker(createLatLng(place.lat, place.lng), place.placeName, '#60a5fa');

      window.naver.maps.Event.addListener(marker, 'click', () => {
        // 검색 마커는 저장 상태를 바꾸지 않고 위치 정보만 보여준다.
        openInfoWindow(marker, place.placeName, place.roadAddressName || place.addressName || '');
      });

      searchMarkers.push(marker);
    });
  }

  // 저장 전 임시 핀을 주황색 마커로 보여준다.
  function renderDraftMarker(place) {
    if (draftMarker) {
      draftMarker.setMap(null);
      draftMarker = null;
    }

    if (!place) return;

    draftMarker = createMarker(createLatLng(place.lat, place.lng), '새 핀', '#f59e0b');
    openInfoWindow(
      draftMarker,
      place.placeName || '새 핀',
      place.roadAddressName || place.addressName || '직접 추가한 위치'
    );
  }

  // 임시 핀과 인포윈도우를 정리한다.
  function clearDraftMarker() {
    if (draftMarker) {
      draftMarker.setMap(null);
      draftMarker = null;
    }
    if (infoWindow) infoWindow.close();
  }

  // 현재 위치를 별도 색상 마커로 표시한다.
  function renderUserMarker(position) {
    if (userMarker) {
      userMarker.setMap(null);
      userMarker = null;
    }

    if (!position) return;

    userMarker = createMarker(createLatLng(position.lat, position.lng), '현재 위치', '#2563eb');
  }

  return {
    initialize,
    getCenter,
    panTo,
    setCenter,
    fitToPlaces,
    renderSavedMarkers,
    addSavedMarker,
    renderSearchMarkers,
    renderDraftMarker,
    clearDraftMarker,
    renderUserMarker,
  };
}

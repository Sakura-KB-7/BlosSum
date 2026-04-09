// 네이버 지도 SDK가 쓰는 LatLng 객체를 만든다.
export function createLatLng(lat, lng) {
  return new window.naver.maps.LatLng(Number(lat), Number(lng));
}

// 브라우저에서 현재 위치를 받아온다.
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('geolocation unavailable'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      reject,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

// 좌표를 주소로 바꿔 저장/검색 보정에 쓸 주소를 만든다.
export function reverseGeocode(lat, lng) {
  return new Promise((resolve) => {
    window.naver.maps.Service.reverseGeocode(
      {
        coords: createLatLng(lat, lng),
        orders: [
          window.naver.maps.Service.OrderType.ROAD_ADDR,
          window.naver.maps.Service.OrderType.ADDR,
        ].join(','),
      },
      (status, response) => {
        if (status !== window.naver.maps.Service.Status.OK || !response?.v2?.results?.length) {
          resolve({ roadAddressName: '', addressName: '' });
          return;
        }

        const results = response.v2.results;
        const road = results.find((item) => item.name === 'roadaddr');
        const jibun = results.find((item) => item.name === 'addr');

        resolve({
          roadAddressName: road?.region
            ? `${road.region.area1.name} ${road.region.area2.name} ${road.region.area3.name} ${road.land?.name || ''} ${road.land?.number1 || ''}`.trim()
            : '',
          addressName: jibun?.region
            ? `${jibun.region.area1.name} ${jibun.region.area2.name} ${jibun.region.area3.name} ${jibun.land?.name || ''} ${jibun.land?.number1 || ''}`.trim()
            : '',
        });
      }
    );
  });
}

// 주소 문자열을 좌표로 바꿔 지도에 표시 가능한 장소 객체로 만든다.
export function geocodeAddress(address, fallbackTitle, fallbackLink) {
  return new Promise((resolve) => {
    window.naver.maps.Service.geocode({ query: address }, (status, response) => {
      if (status !== window.naver.maps.Service.Status.OK) {
        resolve(null);
        return;
      }

      const first = response?.v2?.addresses?.[0];
      if (!first) {
        resolve(null);
        return;
      }

      resolve({
        id: `${first.x}-${first.y}-${fallbackTitle}`,
        placeName: fallbackTitle,
        addressName: first.jibunAddress || address || '',
        roadAddressName: first.roadAddress || address || '',
        lat: Number(first.y),
        lng: Number(first.x),
        placeUrl: fallbackLink || '',
      });
    });
  });
}

let sdkPromise = null;

export function loadNaverMapsSdk() {
  const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;

  if (!clientId) {
    return Promise.reject(new Error('VITE_NAVER_MAP_CLIENT_ID is missing'));
  }

  if (typeof window !== 'undefined' && window.naver?.maps) {
    return Promise.resolve(window.naver);
  }

  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-naver-maps-sdk="true"]');

    const onLoad = () => {
      if (!window.naver?.maps) {
        reject(new Error('Naver Maps SDK failed to initialize'));
        return;
      }
      resolve(window.naver);
    };

    if (existing) {
      if (window.naver?.maps) onLoad();
      else existing.addEventListener('load', onLoad, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=geocoder`;
    script.async = true;
    script.defer = true;
    script.dataset.naverMapsSdk = 'true';
    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener(
      'error',
      () => reject(new Error('Failed to load Naver Maps SDK')),
      { once: true }
    );
    document.head.appendChild(script);
  });

  return sdkPromise;
}

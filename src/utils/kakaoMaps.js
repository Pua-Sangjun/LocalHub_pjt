const KAKAO_MAPS_SDK_URL = 'https://dapi.kakao.com/v2/maps/sdk.js'

let loadPromise = null

export function getKakaoMapsKey() {
  return import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY || ''
}

export function loadKakaoMapsSdk() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('브라우저 환경에서만 지도를 불러올 수 있습니다.'))
  }

  if (window.kakao?.maps) {
    return new Promise((resolve) => {
      if (typeof window.kakao.maps.load === 'function') {
        window.kakao.maps.load(() => resolve(window.kakao.maps))
      } else {
        resolve(window.kakao.maps)
      }
    })
  }

  const key = getKakaoMapsKey()
  if (!key) {
    return Promise.reject(
      new Error('Kakao Maps API 키가 없습니다. VITE_KAKAO_JAVASCRIPT_KEY 환경변수를 확인해 주세요.'),
    )
  }

  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `${KAKAO_MAPS_SDK_URL}?appkey=${encodeURIComponent(key)}&libraries=services&autoload=false`
    script.async = true

    script.onload = () => {
      if (!window.kakao?.maps) {
        reject(new Error('Kakao Maps SDK를 초기화하지 못했습니다.'))
        return
      }

      if (typeof window.kakao.maps.load === 'function') {
        window.kakao.maps.load(() => resolve(window.kakao.maps))
      } else {
        resolve(window.kakao.maps)
      }
    }

    script.onerror = () => {
      reject(
        new Error(
          'Kakao Maps SDK 로드에 실패했습니다. API 키와 사이트 도메인 등록을 확인해 주세요.',
        ),
      )
    }

    document.head.appendChild(script)
  })

  return loadPromise
}

const KAKAO_SDK_URL = 'https://developers.kakao.com/sdk/js/kakao.min.js'

let kakaoLoadPromise = null

function loadKakaoSdk() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('browser only'))
  }
  if (window.Kakao) return Promise.resolve(window.Kakao)
  if (kakaoLoadPromise) return kakaoLoadPromise

  kakaoLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = KAKAO_SDK_URL
    script.async = true
    script.onload = () => {
      if (window.Kakao) resolve(window.Kakao)
      else reject(new Error('Kakao SDK failed to load'))
    }
    script.onerror = () => reject(new Error('Kakao SDK load error'))
    document.head.appendChild(script)
  })

  return kakaoLoadPromise
}

function ensureKakaoReady() {
  const key = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY
  if (!key) return Promise.resolve(null)

  return loadKakaoSdk()
    .then((Kakao) => {
      if (!Kakao.isInitialized()) Kakao.init(key)
      return Kakao.isInitialized() ? Kakao : null
    })
    .catch(() => null)
}

export function buildShareUrl(path) {
  if (path) return new URL(path, window.location.origin).href
  return window.location.href
}

export function getDefaultShareImage() {
  return `${window.location.origin}/localhub-logo.svg`
}

export function buildPostSharePayload({ title, body }) {
  const excerpt = String(body || '')
    .trim()
    .slice(0, 180)
  const suffix = excerpt.length >= 180 ? '...' : ''

  return {
    title: `[LocalHub] ${title}`,
    description: excerpt
      ? `${excerpt}${suffix}\n\n※ 익명 로컬 팁 — LocalHub에서 공유`
      : 'LocalHub 익명 로컬 피드',
    url: buildShareUrl('/board'),
    imageUrl: getDefaultShareImage(),
  }
}

export function buildAttractionSharePayload(place) {
  if (!place) {
    return {
      title: 'LocalHub — 서울 관광지',
      description: '서울 관광지 정보',
      url: buildShareUrl('/attractions'),
      imageUrl: getDefaultShareImage(),
    }
  }

  const title = place.title || '서울 관광지'
  const parts = [place.addr1, place.region].filter(Boolean)
  const description = parts.length ? parts.join(' · ') : '서울 관광지 — LocalHub'

  return {
    title: `${title} | LocalHub`,
    description,
    url: buildShareUrl(`/attractions/${place.id}`),
    imageUrl: place.firstimage || getDefaultShareImage(),
  }
}

export async function shareViaKakao({ title, description, url, imageUrl }) {
  const Kakao = await ensureKakaoReady()
  if (!Kakao?.Share) return false

  const link = url || window.location.href
  const image = imageUrl || getDefaultShareImage()

  await Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title,
      description,
      imageUrl: image,
      link: {
        mobileWebUrl: link,
        webUrl: link,
      },
    },
    buttons: [
      {
        title: 'LocalHub 열기',
        link: { mobileWebUrl: link, webUrl: link },
      },
    ],
  })

  return true
}

export async function shareViaNative({ title, text, url }) {
  if (!navigator.share) return false
  await navigator.share({ title, text, url })
  return true
}

export async function copyShareLink(url) {
  const target = url || window.location.href
  await navigator.clipboard.writeText(target)
  return true
}

export async function shareContent(payload) {
  const { title, description, url, imageUrl } = payload
  const text = description ? `${title}\n\n${description}` : title

  try {
    if (await shareViaKakao({ title, description, url, imageUrl })) {
      return { method: 'kakao' }
    }
  } catch (error) {
    console.warn('Kakao share failed', error)
  }

  try {
    if (await shareViaNative({ title, text, url })) {
      return { method: 'native' }
    }
  } catch (error) {
    if (error?.name === 'AbortError') return { method: 'cancelled' }
    console.warn('Native share failed', error)
  }

  await copyShareLink(url)
  return { method: 'clipboard' }
}

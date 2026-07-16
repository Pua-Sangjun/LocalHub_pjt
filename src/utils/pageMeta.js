const DEFAULT = {
  title: 'LocalHub',
  description: '공공데이터 기반 관광 정보, 익명 피드, AI 챗봇',
  image: '/localhub-logo.svg',
}

function upsertMeta(attr, key, content) {
  if (!content) return
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function setPageMeta({ title, description, image, url } = {}) {
  document.title = title || DEFAULT.title
  upsertMeta('name', 'description', description || DEFAULT.description)
  upsertMeta('property', 'og:title', title || DEFAULT.title)
  upsertMeta('property', 'og:description', description || DEFAULT.description)
  upsertMeta('property', 'og:type', 'website')
  upsertMeta('property', 'og:image', image || DEFAULT.image)
  if (url) upsertMeta('property', 'og:url', url)
}

export function resetPageMeta() {
  setPageMeta()
}

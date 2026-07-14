import { ref } from 'vue'

const tourData = ref(null)

export async function loadTourData() {
  if (tourData.value) return tourData.value

  const sources = [
    '/data/서울_관광지.json',
    '/data/서울_축제공연행사.json',
    '/data/서울_레포츠.json',
    '/data/서울_문화시설.json',
    '/data/서울_쇼핑.json',
    '/data/서울_숙박.json',
    '/data/서울_여행코스.json',
  ]

  const results = await Promise.all(
    sources.map(async (path) => {
      const response = await fetch(path)
      if (!response.ok) {
        return null
      }
      return response.json()
    })
  )

  const merged = results
    .filter(Boolean)
    .flatMap((file) =>
      Array.isArray(file.items)
        ? file.items.map((item) => ({
            ...item,
            dataType: file.contentType || '알 수 없음',
          }))
        : []
    )

  tourData.value = merged
  return tourData.value
}

export function getTypeOptions() {
  return ['관광지', '축제공연행사', '레포츠', '문화시설', '쇼핑', '숙박', '여행코스']
}

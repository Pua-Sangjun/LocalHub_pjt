import { ref, onMounted } from 'vue'
import {
  fetchKmaShortTermTemperature,
  getLatestTmfc,
  getNearestFutureTmef,
} from '@/api/weather'

export function useKmaWeather() {
  const weather = ref(null)
  const weatherLoading = ref(false)
  const weatherError = ref(null)

  async function loadKmaWeather() {
    weatherLoading.value = true
    weatherError.value = null

    try {
      const now = new Date()
      const tmfc = getLatestTmfc(now)
      const tmef = getNearestFutureTmef(now, tmfc)
      const result = await fetchKmaShortTermTemperature({
        tmfc,
        tmef,
        nx: 60,
        ny: 127,
        vars: 'TMP',
      })
      weather.value = result
    } catch (err) {
      weatherError.value = err?.message || '날씨 정보를 불러오지 못했습니다.'
    } finally {
      weatherLoading.value = false
    }
  }

  onMounted(() => {
    loadKmaWeather()
  })

  return {
    weather,
    weatherLoading,
    weatherError,
    loadKmaWeather,
  }
}

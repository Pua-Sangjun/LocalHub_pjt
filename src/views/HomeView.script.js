import { ref, onMounted, onUnmounted, defineComponent, computed } from 'vue'
import MapWithPins from '@/components/MapWithPins.vue'
import { posts as boardPosts } from '@/stores/posts'
import cityCarousel from '@/assets/images/city_carousel.jpg'
import hanokCarousel from '@/assets/images/hanok_carousel.jpg'
import hangangCarousel from '@/assets/images/hangang_carousel.jpg'
import namsanCarousel from '@/assets/images/namsan_carousel.jpg'
import {
  fetchKmaShortTermTemperature,
  getLatestTmfc,
  getNearestFutureTmef,
} from '@/api/weather'

export default defineComponent({
  name: 'HomeView',
  components: {
    MapWithPins,
  },
  setup() {
    const posts = computed(() =>
      boardPosts.value.slice(0, 5).map((post) => ({
        id: post.id,
        title: post.title,
        date: new Date(post.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
      }))
    )

    const heroSlides = [
      {
        id: 'hangang',
        label: '한강',
        title: '도시 속 새로운 서울',
        subtitle: '한강, 도심, 골목을 담은 서울 여행',
        image: hangangCarousel,
      },
      {
        id: 'city',
        label: '도시',
        title: '도심의 활력, 밤의 서울',
        subtitle: '서울 도심의 반짝이는 야경을 담다',
        image: cityCarousel,
      },
      {
        id: 'hanok',
        label: '한옥',
        title: '한옥의 여유를 담다',
        subtitle: '전통과 모던이 공존하는 서울의 순간',
        image: hanokCarousel,
      },
      {
        id: 'namsan',
        label: '남산',
        title: '남산에서 보는 서울',
        subtitle: '숨겨진 전망과 여유로운 산책 코스',
        image: namsanCarousel,
      },
    ]

    const quickAccessCards = [
      {
        title: '실시간 축제',
        description: '서울에서 진행 중인 최신 공연 및 축제를 확인하세요.',
      },
      {
        title: '추천 여행 코스',
        description: '서울 여행 동선을 고려한 인기 코스 정보를 제공합니다.',
        accent: true,
      },
      {
        title: '서울 로컬 이야기',
        description: '현지인이 남긴 생생한 피드로 숨은 명소를 만나보세요.',
      },
    ]

    const activeSlide = ref(0)
    const fadingSlide = ref(null)
    const weather = ref(null)
    const weatherLoading = ref(false)
    const weatherError = ref(null)
    let slideInterval = null
    let fadeTimeout = null

    const setSlide = (index) => {
      if (index === activeSlide.value) return

      fadingSlide.value = activeSlide.value
      activeSlide.value = index

      if (fadeTimeout) clearTimeout(fadeTimeout)
      fadeTimeout = setTimeout(() => {
        fadingSlide.value = null
      }, 1200)
    }

    const nextSlide = () => setSlide((activeSlide.value + 1) % heroSlides.length)
    const prevSlide = () => setSlide((activeSlide.value - 1 + heroSlides.length) % heroSlides.length)

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

    onMounted(async () => {
      await loadKmaWeather()
      slideInterval = setInterval(nextSlide, 6000)
    })

    onUnmounted(() => {
      if (slideInterval) clearInterval(slideInterval)
      if (fadeTimeout) clearTimeout(fadeTimeout)
    })

    const goToWrite = () => {
      alert('글쓰기 화면으로 이동')
    }

    const goToDetail = (id) => {
      alert(`${id}번 게시글 상세 보기`)
    }

    return {
      posts,
      heroSlides,
      quickAccessCards,
      activeSlide,
      fadingSlide,
      weather,
      weatherLoading,
      weatherError,
      nextSlide,
      prevSlide,
      goToWrite,
      goToDetail,
    }
  },
})

import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MapWithPins from '@/components/MapWithPins.vue'
import { loadAttractions } from '@/utils/attractions'
import { posts } from '@/stores/posts'
import { useChatbot } from '@/composables/useChatbot'
import cityCarousel from '@/assets/images/city_carousel.jpg'
import hanokCarousel from '@/assets/images/hanok_carousel.jpg'
import hangangCarousel from '@/assets/images/hangang_carousel.jpg'
import namsanCarousel from '@/assets/images/namsan_carousel.jpg'

const DATA_STATS = [
  { label: '관광지', count: 783 },
  { label: '축제·행사', count: 201 },
  { label: '여행코스', count: 51 },
  { label: '문화시설', count: 566 },
]

export default defineComponent({
  name: 'HomeView',
  components: {
    MapWithPins,
  },
  setup() {
    const router = useRouter()
    const { openChat } = useChatbot()
    const previewPlaces = ref([])
    const mapLoading = ref(true)

    const heroSlides = [
      {
        id: 'hangang',
        label: '한강',
        image: hangangCarousel,
      },
      {
        id: 'city',
        label: '도시',
        image: cityCarousel,
      },
      {
        id: 'hanok',
        label: '한옥',
        image: hanokCarousel,
      },
      {
        id: 'namsan',
        label: '남산',
        image: namsanCarousel,
      },
    ]

    const latestPosts = computed(() => posts.value.slice(0, 3))

    const activeSlide = ref(0)
    const fadingSlide = ref(null)
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

    onMounted(async () => {
      slideInterval = setInterval(nextSlide, 6000)

      try {
        const attractions = await loadAttractions()
        previewPlaces.value = attractions
          .filter((place) => place.lat && place.lon)
          .slice(0, 48)
      } catch (error) {
        console.error('failed to load map preview places', error)
      } finally {
        mapLoading.value = false
      }
    })

    onUnmounted(() => {
      if (slideInterval) clearInterval(slideInterval)
      if (fadeTimeout) clearTimeout(fadeTimeout)
    })

    const goToWrite = () => {
      router.push({ name: 'post-write' })
    }

    const goToDetail = (id) => {
      router.push({ name: 'post-detail', params: { id } })
    }

    const goToAttractions = () => {
      router.push({ name: 'attractions' })
    }

    const goToBoard = () => {
      router.push({ name: 'board-list' })
    }

    const toggleChat = () => {
      openChat()
    }

    function formattedDate(value) {
      return new Date(value).toLocaleString('ko-KR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    }

    return {
      previewPlaces,
      mapLoading,
      heroSlides,
      dataStats: DATA_STATS,
      latestPosts,
      activeSlide,
      fadingSlide,
      nextSlide,
      prevSlide,
      goToWrite,
      goToDetail,
      goToAttractions,
      goToBoard,
      toggleChat,
      formattedDate,
    }
  },
})

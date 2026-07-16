import { buildAttractionSharePayload, buildPostSharePayload, shareContent } from '@/utils/share'
import { ref } from 'vue'

const FEEDBACK_MESSAGES = {
  kakao: '카카오톡 공유 창을 열었습니다.',
  native: '공유했습니다.',
  clipboard: '링크를 복사했습니다.',
  cancelled: '',
}

export function useShare() {
  const sharing = ref(false)
  const feedback = ref('')

  let feedbackTimer = null

  function showFeedback(message) {
    feedback.value = message
    if (feedbackTimer) clearTimeout(feedbackTimer)
    feedbackTimer = setTimeout(() => {
      feedback.value = ''
    }, 2500)
  }

  async function share(payload) {
    if (sharing.value) return null
    sharing.value = true

    try {
      const result = await shareContent(payload)
      const message = FEEDBACK_MESSAGES[result.method]
      if (message) showFeedback(message)
      return result
    } catch {
      showFeedback('공유에 실패했습니다.')
      return null
    } finally {
      sharing.value = false
    }
  }

  function sharePost(post) {
    if (!post) return Promise.resolve(null)
    return share(buildPostSharePayload(post))
  }

  function shareAttraction(place) {
    if (!place) return Promise.resolve(null)
    return share(buildAttractionSharePayload(place))
  }

  function sharePage({ title, description, url } = {}) {
    return share({
      title: title || 'LocalHub',
      description:
        description || '공공데이터 기반 관광 정보, 익명 피드, AI 챗봇을 한곳에서.',
      url: url || window.location.href,
    })
  }

  return {
    sharing,
    feedback,
    share,
    sharePost,
    shareAttraction,
    sharePage,
  }
}

import { ref } from 'vue'

const isChatOpen = ref(false)

export function useChatbot() {
  function openChat() {
    isChatOpen.value = true
  }

  function closeChat() {
    isChatOpen.value = false
  }

  function toggleChat() {
    isChatOpen.value = !isChatOpen.value
  }

  return {
    isChatOpen,
    openChat,
    closeChat,
    toggleChat,
  }
}

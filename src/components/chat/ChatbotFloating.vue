<template>
  <div class="chatbot-floating" :class="{ open: isChatOpen, mobile: isMobile }">
    <Transition name="panel">
      <div v-if="isChatOpen" class="chat-panel" role="dialog" aria-label="LocalHub 챗봇">
        <header class="chat-header">
          <div class="chat-header-info">
            <span class="chat-avatar">🤖</span>
            <div>
              <strong>LocalHub 챗봇</strong>
              <p>서울 여행 · 축제 · 게시판 도우미</p>
            </div>
          </div>
          <div class="chat-header-actions">
            <button type="button" class="icon-btn" title="대화 초기화" @click="clearHistory">↺</button>
            <button type="button" class="icon-btn" title="닫기" @click="closePanel">✕</button>
          </div>
        </header>

        <section ref="chatBodyRef" class="chat-body">
          <div v-if="messages.length === 0" class="welcome-block">
            <p>안녕하세요! 서울 관광지, 축제 일정, 커뮤니티 게시글 검색을 도와드려요.</p>
          </div>

          <div
            v-for="(item, index) in messages"
            :key="index"
            :class="['chat-bubble-row', item.role]"
          >
            <div :class="['chat-bubble', item.role]">
              <span class="bubble-label">{{ item.role === 'user' ? '나' : '챗봇' }}</span>
              <p>{{ item.text }}</p>
            </div>
          </div>

          <div v-if="isLoading" class="chat-bubble-row bot">
            <div class="chat-bubble bot typing">
              <span class="bubble-label">챗봇</span>
              <span class="typing-dots"><i /><i /><i /></span>
            </div>
          </div>
        </section>

        <div class="suggestions-bar">
          <span class="suggestions-label">추천 질문</span>
          <div class="suggestions">
            <button
              v-for="item in suggestions"
              :key="item"
              type="button"
              class="suggestion-chip"
              :disabled="isLoading"
              @click="askSuggestion(item)"
            >
              {{ item }}
            </button>
          </div>
        </div>

        <footer class="chat-input-area">
          <input
            ref="inputRef"
            v-model="question"
            type="text"
            placeholder="권역별 관광지, 축제 일정, 게시글 검색..."
            @compositionstart="isComposing = true"
            @compositionend="isComposing = false"
            @keydown.enter.prevent="handleEnter"
          />
          <button type="button" class="send-btn" :disabled="isLoading || !question.trim()" @click="sendQuestion">
            전송
          </button>
        </footer>
      </div>
    </Transition>

    <button
      class="fab"
      type="button"
      :aria-expanded="isChatOpen"
      aria-label="챗봇 열기"
      @click="toggleOpen"
    >
      <svg v-if="!isChatOpen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <span v-else>✕</span>
    </button>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { sendChatMessage } from '@/api/chat'
import { buildChatContext, SUGGESTED_QUESTIONS } from '@/utils/chatContext'
import { loadTourData } from '@/utils/dataService'
import { getPosts } from '@/stores/posts'
import { useChatbot } from '@/composables/useChatbot'

const STORAGE_KEY = 'localhub-chat-history'

const { isChatOpen, toggleChat, closeChat } = useChatbot()
const isMobile = ref(false)
const question = ref('')
const messages = ref([])
const isLoading = ref(false)
const tourItems = ref([])
const chatBodyRef = ref(null)
const inputRef = ref(null)
const isComposing = ref(false)
const suggestions = SUGGESTED_QUESTIONS

function loadHistory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []
    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.value))
}

function updateMobileFlag() {
  isMobile.value = window.innerWidth <= 640
}

watch(messages, saveHistory, { deep: true })

onMounted(async () => {
  messages.value = loadHistory()
  tourItems.value = await loadTourData()
  updateMobileFlag()
  window.addEventListener('resize', updateMobileFlag)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateMobileFlag)
})

function toggleOpen() {
  toggleChat()
  if (isChatOpen.value) {
    nextTick(() => inputRef.value?.focus())
  }
}

function closePanel() {
  closeChat()
}

function clearHistory() {
  messages.value = []
  localStorage.removeItem(STORAGE_KEY)
}

async function scrollToBottom() {
  await nextTick()
  if (chatBodyRef.value) {
    chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
  }
}

function focusInput() {
  nextTick(() => inputRef.value?.focus())
}

function toApiHistory() {
  return messages.value
    .filter((item) => item.role === 'user' || item.role === 'bot')
    .slice(-8)
    .map((item) => ({
      role: item.role === 'bot' ? 'assistant' : 'user',
      content: item.text,
    }))
}

function handleEnter(event) {
  if (event.isComposing || isComposing.value) return
  sendQuestion()
}

async function sendQuestion() {
  if (isComposing.value) return
  const text = question.value.trim()
  if (!text || isLoading.value) return

  messages.value.push({ role: 'user', text })
  question.value = ''
  isLoading.value = true
  focusInput()
  await scrollToBottom()

  try {
    const context = buildChatContext(text, tourItems.value, getPosts())
    const reply = await sendChatMessage({
      message: text,
      history: toApiHistory().slice(0, -1),
      context,
    })
    messages.value.push({ role: 'bot', text: reply })
  } catch (error) {
    messages.value.push({
      role: 'bot',
      text: `응답 중 오류가 발생했습니다. ${error.message}`,
    })
  } finally {
    isLoading.value = false
    await scrollToBottom()
    focusInput()
  }
}

function askSuggestion(text) {
  question.value = text
  nextTick(() => sendQuestion())
}
</script>

<style scoped>
.chatbot-floating {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(79, 70, 229, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.fab:hover {
  transform: translateY(-2px);
}

.chat-panel {
  width: min(380px, calc(100vw - 2rem));
  max-height: min(560px, calc(100vh - 6rem));
  margin-bottom: 0.75rem;
  background: #ffffff;
  border-radius: 1.1rem;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.18);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chatbot-floating.mobile.open .chat-panel {
  position: fixed;
  right: 0;
  left: 0;
  bottom: 0;
  width: 100%;
  max-height: 85vh;
  margin-bottom: 0;
  border-radius: 1.1rem 1.1rem 0 0;
}

.chat-header {
  padding: 0.9rem 1rem;
  background: linear-gradient(135deg, #4f46e5, #4338ca);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.chat-header-info p {
  margin: 0.15rem 0 0;
  font-size: 0.75rem;
  opacity: 0.85;
}

.chat-avatar {
  font-size: 1.4rem;
}

.chat-header-actions {
  display: flex;
  gap: 0.25rem;
}

.icon-btn {
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
}

.chat-body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  flex: 1;
  min-height: 220px;
  background: #f8fafc;
}

.welcome-block p {
  margin: 0;
  font-size: 0.9rem;
  color: #475569;
  line-height: 1.5;
}

.suggestions-bar {
  padding: 0.65rem 0.85rem;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  flex-shrink: 0;
}

.suggestions-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
}

.suggestions {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.45rem;
  overflow-x: auto;
  padding-bottom: 0.1rem;
  scrollbar-width: thin;
}

.suggestion-chip {
  border: 1px solid #c7d2fe;
  background: #eef2ff;
  color: #3730a3;
  border-radius: 999px;
  padding: 0.4rem 0.75rem;
  font-size: 0.78rem;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.suggestion-chip:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-bubble-row {
  display: flex;
}

.chat-bubble-row.user {
  justify-content: flex-end;
}

.chat-bubble {
  max-width: 88%;
  padding: 0.65rem 0.85rem;
  border-radius: 1rem;
  font-size: 0.9rem;
  line-height: 1.45;
}

.chat-bubble p {
  margin: 0.25rem 0 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.bubble-label {
  font-size: 0.7rem;
  font-weight: 700;
  opacity: 0.7;
}

.chat-bubble.bot {
  background: #eef2ff;
  color: #1e3a8a;
  border-bottom-left-radius: 0.25rem;
}

.chat-bubble.user {
  background: #e2e8f0;
  color: #0f172a;
  border-bottom-right-radius: 0.25rem;
}

.chat-bubble.typing {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
}

.typing-dots {
  display: inline-flex;
  gap: 4px;
}

.typing-dots i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6366f1;
  animation: blink 1.2s infinite;
}

.typing-dots i:nth-child(2) { animation-delay: 0.2s; }
.typing-dots i:nth-child(3) { animation-delay: 0.4s; }

@keyframes blink {
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
}

.chat-input-area {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  padding: 0.85rem;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.chat-input-area input {
  flex: 1;
  width: auto;
  min-width: 0;
  height: 42px;
  padding: 0 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.75rem;
  outline: none;
  font-family: inherit;
  font-size: 0.9rem;
  line-height: 42px;
  background: #ffffff;
  box-sizing: border-box;
}

.chat-input-area input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
}

.send-btn {
  align-self: flex-end;
  height: 42px;
  padding: 0 1rem;
  border: none;
  background: #4f46e5;
  color: white;
  border-radius: 0.75rem;
  cursor: pointer;
  font-weight: 600;
  min-width: 56px;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.panel-enter-active,
.panel-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
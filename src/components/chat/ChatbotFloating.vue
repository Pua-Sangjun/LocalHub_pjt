<template>
  <div class="chatbot-floating">
    <button class="fab" @click="toggleOpen">
      {{ open ? '×' : '💬' }}
    </button>

    <div v-if="open" class="chat-panel">
      <header class="chat-header">
        <span>LocalHub 챗봇</span>
        <button class="close-btn" @click="toggleOpen">닫기</button>
      </header>

      <section class="chat-body">
        <div v-if="history.length === 0" class="chat-item bot">
          안녕하세요! 서울 지역 여행 정보와 게시판 도움을 드려요.
        </div>

        <div v-for="(item, index) in history" :key="index" :class="['chat-item', item.role]">
          {{ item.text }}
        </div>
      </section>

      <footer class="chat-input-area">
        <input
          type="text"
          v-model="question"
          @keyup.enter="sendQuestion"
          placeholder="질문을 입력하세요"
        />
        <button type="button" @click="sendQuestion" :disabled="isLoading">
          {{ isLoading ? '응답 중...' : '전송' }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { loadTourData } from '@/utils/dataService'

const open = ref(false)
const question = ref('')
const history = ref([])
const isLoading = ref(false)
const tourItems = ref([])

const apiKey = import.meta.env.VITE_OPENAI_API_KEY
const persistedKey = 'localhub-chat-history'

function loadHistory() {
  try {
    const saved = localStorage.getItem(persistedKey)
    if (!saved) return []
    return JSON.parse(saved)
  } catch {
    return []
  }
}

function saveHistory() {
  localStorage.setItem(persistedKey, JSON.stringify(history.value))
}

watch(history, saveHistory, { deep: true })

onMounted(async () => {
  history.value = loadHistory()
  tourItems.value = await loadTourData()
})

const dataSummary = computed(() => {
  const total = tourItems.value.length
  const categories = Array.from(new Set(tourItems.value.map((item) => item.dataType)))
  return `서울 지역 관광 데이터 ${total}건, 포함된 분류: ${categories.join(' / ')}.`
})

function toggleOpen() {
  open.value = !open.value
}

async function sendQuestion() {
  const message = question.value.trim()
  if (!message || isLoading.value) return
  history.value.push({ role: 'user', text: message })
  question.value = ''
  isLoading.value = true

  try {
    const answer = await requestChatCompletion(message)
    history.value.push({ role: 'bot', text: answer })
  } catch (error) {
    history.value.push({ role: 'bot', text: `응답 중 오류가 발생했습니다. ${error.message}` })
  } finally {
    isLoading.value = false
  }
}

async function requestChatCompletion(message) {
  if (!apiKey) {
    throw new Error('API 키가 설정되지 않았습니다. .env 파일에 VITE_OPENAI_API_KEY를 추가하세요.')
  }

  const body = {
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `당신은 서울 관광 데이터 기반 여행 도우미입니다. ${dataSummary.value}`,
      },
      { role: 'user', content: message },
    ],
    temperature: 0.8,
    max_tokens: 450,
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    const message = errorBody?.error?.message || response.statusText
    throw new Error(message)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content?.trim() || '죄송합니다. 답변을 생성할 수 없습니다.'
}
</script>

<style scoped>
.chatbot-floating {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: #4f46e5;
  color: white;
  font-size: 1.4rem;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(79, 70, 229, 0.25);
}

.chat-panel {
  width: 320px;
  max-height: 440px;
  margin-bottom: 0.75rem;
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 0.9rem 1rem;
  background: #4f46e5;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  border: none;
  background: transparent;
  color: white;
  font-size: 1rem;
  cursor: pointer;
}

.chat-body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  min-height: 180px;
  background: #f8fafc;
}

.chat-item {
  padding: 0.75rem 0.9rem;
  border-radius: 1rem;
  max-width: 100%;
}

.chat-item.bot {
  background: #eef2ff;
  color: #1d4ed8;
  align-self: flex-start;
}

.chat-item.user {
  background: #e2e8f0;
  color: #0f172a;
  align-self: flex-end;
}

.chat-input-area {
  display: flex;
  gap: 0.5rem;
  padding: 0.9rem;
  background: #ffffff;
}

.chat-input-area input {
  flex: 1;
  padding: 0.75rem 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  outline: none;
}

.chat-input-area button {
  padding: 0 1rem;
  border: none;
  background: #4f46e5;
  color: white;
  border-radius: 999px;
  cursor: pointer;
}
</style>
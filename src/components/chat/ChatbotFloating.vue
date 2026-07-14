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
        <div class="chat-item bot">안녕하세요! 지역 정보를 물어보세요.</div>
        <div v-for="(item, index) in history" :key="index" class="chat-item user">
          {{ item }}
        </div>
      </section>

      <footer class="chat-input-area">
        <input
          type="text"
          v-model="question"
          @keyup.enter="sendQuestion"
          placeholder="질문을 입력하세요"
        />
        <button type="button" @click="sendQuestion">전송</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const open = ref(false)
const question = ref('')
const history = ref([])

function toggleOpen() {
  open.value = !open.value
}

function sendQuestion() {
  if (!question.value.trim()) return
  history.value.push(question.value.trim())
  question.value = ''
  // TODO: OpenAI API 호출 로직을 여기에 연결
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
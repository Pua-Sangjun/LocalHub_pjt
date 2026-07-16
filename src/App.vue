<template>
  <div id="app">
    <main class="app-main">
      <router-view />
    </main>
    <ChatbotFloating />
  </div>
</template>

<script setup>
import ChatbotFloating from '@/components/chat/ChatbotFloating.vue'
</script>

<style>
html,
body {
  margin: 0;
  overflow-y: auto;
}

html,
body,
#app {
  min-height: 100%;
  width: 100%;
  max-width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans KR", sans-serif;
  background-color: #f8fafc;
}
</style>

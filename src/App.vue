<template>
  <div id="app">
    <HeaderLayout />

    <main class="app-main">
      <router-view />
    </main>

    <FooterLayout />
    <ChatbotFloating />
  </div>
</template>

<script setup>
import HeaderLayout from './components/HeaderLayout.vue'
import FooterLayout from './components/FooterLayout.vue'
import ChatbotFloating from './components/chat/ChatbotFloating.vue'
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fb;
  color: #111;
}

.app-main {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}
</style>
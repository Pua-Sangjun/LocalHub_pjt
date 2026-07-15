<template>
<div id="app">
  <main class="app-main">
      <router-view />
  </main>
</div>  
</template>

<script setup>
</script>

<style>
/* 앱 전체 공통 레이아웃은 필요한 경우 여기에서 정의합니다 */
html, body, #app {
  margin: 0;
  min-height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans KR", sans-serif;
  background-color: #f8fafc;
}
</style>

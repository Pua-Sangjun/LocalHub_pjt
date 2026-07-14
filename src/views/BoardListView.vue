<template>
  <section class="page-section">
    <div class="page-header">
      <div>
        <h1>게시판</h1>
        <p>익명 게시판입니다. 글 작성, 조회, 수정, 삭제를 localStorage에 저장합니다.</p>
      </div>
      <button class="button" @click="goWrite">새 글 작성</button>
    </div>

    <div class="panel">
      <div class="field-row">
        <input v-model="search" type="search" placeholder="제목 또는 내용을 검색하세요" />
      </div>
    </div>

    <div class="card-grid">
      <article v-for="post in filteredPosts" :key="post.id" class="board-card">
        <h3>{{ post.title }}</h3>
        <p>{{ post.body.slice(0, 120) }}{{ post.body.length > 120 ? '...' : '' }}</p>
        <div class="field-row" style="align-items:center;">
          <small>{{ post.author }} · {{ formattedDate(post.createdAt) }}</small>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <span class="badge">조회수 {{ post.views }}</span>
            <span class="badge">좋아요 {{ post.likes }}</span>
          </div>
        </div>
        <router-link class="button button-secondary" :to="{ name: 'post-detail', params: { id: post.id } }">자세히 보기</router-link>
      </article>
    </div>

    <div v-if="filteredPosts.length === 0" class="panel">
      <p class="data-meta">검색 결과가 없습니다. 새로운 글을 작성해보세요.</p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { posts } from '@/stores/posts'

const router = useRouter()
const search = ref('')

const filteredPosts = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) {
    return [...posts.value]
  }
  return posts.value.filter((post) => {
    return (
      post.title.toLowerCase().includes(query) ||
      post.body.toLowerCase().includes(query)
    )
  })
})

function goWrite() {
  router.push({ name: 'post-write' })
}

function formattedDate(value) {
  return new Date(value).toLocaleString('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
</script>

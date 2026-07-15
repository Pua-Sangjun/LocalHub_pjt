<template>
  <section class="page-section board-detail">
    <div class="detail-header">
      <div>
        <p class="breadcrumb">홈 / 서울/강남 게시판 / 게시글 상세</p>
        <h1>{{ post ? post.title : '게시글을 찾을 수 없습니다.' }}</h1>
        <div v-if="post" class="detail-meta">
          <span>anonymous</span>
          <span>{{ formattedDate(post.createdAt) }}</span>
        </div>
      </div>

      <button class="button button-secondary" @click="goBack">
        목록으로
      </button>
    </div>

    <div class="detail-card">
      <div v-if="post">
        <div class="detail-info">
          <span>조회수 {{ post.views }}</span>
          <span>좋아요 {{ post.likes }}</span>
        </div>

        <article class="detail-body">
          <p>{{ post.body }}</p>
        </article>

        <div class="detail-buttons">
          <button class="button-secondary" @click="editPost">수정</button>
          <button class="button" @click="likePost">좋아요</button>
          <button class="button-danger" @click="deletePost">삭제</button>
        </div>
      </div>

      <div v-else class="empty-panel">
        <p>존재하지 않는 게시물입니다.</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  getPostById,
  incrementViews,
  deletePost as removePost,
  validatePostPassword,
  toggleLike,
} from '@/stores/posts'

const router = useRouter()
const route = useRoute()
const id = route.params.id

const post = computed(() => getPostById(id))

onMounted(() => {
  if (post.value) {
    incrementViews(id)
  }
})

function formattedDate(value) {
  return new Date(value).toLocaleString('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function goBack() {
  router.push({ name: 'board-list' })
}

function editPost() {
  router.push({ name: 'post-edit', params: { id } })
}

function likePost() {
  if (!post.value) return
  toggleLike(id)
}

function deletePost() {
  if (!post.value) return
  const password = window.prompt('삭제를 위해 비밀번호를 입력해주세요.')
  if (!password) return
  if (!validatePostPassword(id, password)) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }
  removePost(id)
  router.push({ name: 'board-list' })
}
</script>

<style scoped>
.board-detail {
  display: grid;
  gap: 1.5rem;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.detail-header h1 {
  margin: 0.6rem 0 0;
  font-size: clamp(2rem, 2.5vw, 2.4rem);
}

.detail-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.85rem;
  color: #64748b;
}

.detail-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  padding: 1.75rem;
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.06);
}

.detail-info {
  display: flex;
  gap: 1rem;
  color: #475569;
  margin-bottom: 1.25rem;
}

.detail-body {
  white-space: pre-wrap;
  line-height: 1.8;
  color: #334155;
  margin-bottom: 1.75rem;
}

.detail-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.empty-panel {
  padding: 2rem;
  text-align: center;
  color: #64748b;
}
</style>


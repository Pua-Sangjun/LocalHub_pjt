<template>
  <section class="page-section">
    <div class="page-header">
      <div>
        <h1>게시글 상세</h1>
        <p>게시글 내용을 확인하고 수정 또는 삭제를 진행하세요.</p>
      </div>
      <button class="button button-secondary" @click="goBack">목록으로</button>
    </div>

    <div v-if="post" class="panel">
      <div class="field-row" style="justify-content:space-between; gap:1rem; align-items:flex-start;">
        <div>
          <h2>{{ post.title }}</h2>
          <div class="data-meta">{{ formattedDate(post.createdAt) }} · 작성자 {{ post.author }}</div>
        </div>
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
          <span class="badge">조회수 {{ post.views }}</span>
          <span class="badge">좋아요 {{ post.likes }}</span>
        </div>
      </div>

      <p style="white-space:pre-wrap; margin-top:1rem;">{{ post.body }}</p>

      <div class="field-row" style="justify-content:flex-end; gap:0.75rem; margin-top:1.5rem;">
        <button class="button button-secondary" @click="editPost">수정</button>
        <button class="button button-secondary" @click="likePost">좋아요</button>
        <button class="button button-danger" @click="deletePost">삭제</button>
      </div>
    </div>

    <div v-else class="panel">
      <p class="data-meta">존재하지 않는 게시물입니다.</p>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getPostById, incrementViews, deletePost as removePost, validatePostPassword, toggleLike } from '@/stores/posts'

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
  const password = window.prompt('게시글 삭제를 위해 비밀번호를 입력해주세요.')
  if (!password) return
  if (!validatePostPassword(id, password)) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }
  removePost(id)
  router.push({ name: 'board-list' })
}
</script>

<template>
  <div class="board-detail-page">
    <div class="detail-shell">
      <header class="detail-hero">
        <p class="breadcrumb">
          <RouterLink to="/">홈</RouterLink>
          <span aria-hidden="true">/</span>
          <RouterLink to="/board">로컬 이야기</RouterLink>
          <span aria-hidden="true">/</span>
          <span>게시글 상세</span>
        </p>

        <div class="detail-hero-row">
          <div class="detail-hero-copy">
            <h1>{{ post ? post.title : '게시글을 찾을 수 없습니다.' }}</h1>
            <div v-if="post" class="detail-meta">
              <span class="post-badge">익명</span>
              <time>{{ formattedDate(post.createdAt) }}</time>
              <span>조회 {{ post.views }}</span>
              <span>좋아요 {{ post.likes }}</span>
            </div>
          </div>
          <button class="secondary-btn desktop-only" type="button" @click="goBack">목록으로</button>
        </div>
      </header>

      <section class="detail-card">
        <article v-if="post" class="detail-body">
          <p>{{ post.body }}</p>
        </article>

        <div v-else class="empty-panel">
          <p>존재하지 않는 게시물입니다.</p>
          <button class="primary-btn" type="button" @click="goBack">목록으로 돌아가기</button>
        </div>

        <div v-if="post" class="detail-actions">
          <button class="secondary-btn mobile-only" type="button" @click="goBack">목록으로</button>
          <ShareButton mode="post" :post="post" />
          <button class="secondary-btn" type="button" @click="editPost">수정</button>
          <button class="primary-btn" type="button" @click="likePost">좋아요</button>
          <button class="danger-btn" type="button" @click="deletePost">삭제</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ShareButton from '@/components/ShareButton.vue'
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
.board-detail-page {
  width: 100%;
  max-width: 100%;
  min-height: calc(100vh - 80px);
  overflow-x: hidden;
  background: #eaedf2;
  padding: 28px var(--page-inline-padding, 24px) 56px;
}

.detail-shell {
  width: 100%;
  max-width: 860px;
  margin: 0 auto;
  display: grid;
  gap: 16px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 12px;
  color: #64748b;
  font-size: 0.9rem;
}

.breadcrumb a {
  color: inherit;
  text-decoration: none;
}

.breadcrumb a:hover {
  color: #1a5fa0;
}

.detail-hero-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.detail-hero-copy {
  min-width: 0;
  flex: 1;
}

.detail-hero h1 {
  margin: 0 0 12px;
  font-size: clamp(1.5rem, 3vw, 2.1rem);
  line-height: 1.35;
  color: #0f172a;
  word-break: break-word;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  color: #64748b;
  font-size: 0.84rem;
}

.post-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 999px;
  background: #e8f6ff;
  color: #1a5fa0;
}

.detail-card {
  width: 100%;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
  padding: 24px;
}

.detail-body {
  margin: 0;
}

.detail-body p {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.8;
  color: #334155;
  font-size: 0.98rem;
  word-break: break-word;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.empty-panel {
  display: grid;
  gap: 14px;
  justify-items: center;
  padding: 32px 16px;
  text-align: center;
  color: #64748b;
}

.primary-btn,
.secondary-btn,
.danger-btn {
  border-radius: 12px;
  padding: 11px 18px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
}

.primary-btn {
  border: none;
  background: #8fd3ff;
  color: #0f172a;
}

.secondary-btn {
  background: #fff;
  color: #334155;
  border: 1px solid #cbd5e1;
}

.danger-btn {
  border: none;
  background: #fee2e2;
  color: #b91c1c;
}

.mobile-only {
  display: none;
}

@media (max-width: 640px) {
  .board-detail-page {
    padding-bottom: 40px;
  }

  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: inline-flex;
    width: 100%;
    justify-content: center;
  }

  .detail-card {
    padding: 18px 16px;
  }

  .detail-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .detail-actions .mobile-only,
  .detail-actions .danger-btn {
    grid-column: 1 / -1;
  }
}
</style>

<template>
  <div class="board-page">
    <header class="board-hero">
      <p class="breadcrumb">
        <RouterLink to="/">홈</RouterLink>
        <span aria-hidden="true">/</span>
        <span>로컬 이야기</span>
      </p>
      <div class="board-hero-row">
        <div>
          <h1>로컬 이야기</h1>
          <p class="board-description">
            본인만의 서울 정보를 마음껏 올려주세요!
          </p>
          <div class="feature-badges">
            <span class="feature-badge">맛집 투어</span>
            <span class="feature-badge">숨겨진 관광 스팟</span>
            <span class="feature-badge">축제 홍보</span>
          </div>
        </div>
        <button class="primary-btn" type="button" @click="goWrite">✏️ 글쓰기</button>
      </div>
    </header>

    <section class="board-toolbar card">
      <div class="toolbar-meta">
        <strong>{{ filteredPosts.length }}</strong>
        <span>개의 글</span>
      </div>

      <form class="search-box" @submit.prevent="applySearch">
        <input
          v-model="searchText"
          type="search"
          placeholder="제목 또는 내용 검색"
          aria-label="게시글 검색"
        />
        <button class="secondary-btn" type="submit">검색</button>
      </form>
    </section>

    <section class="board-list card">
      <ul v-if="filteredPosts.length" class="post-list">
        <li v-for="(post, index) in filteredPosts" :key="post.id" class="post-item">
          <RouterLink :to="{ name: 'post-detail', params: { id: post.id } }" class="post-link">
            <span class="post-number">{{ posts.length - index }}</span>
            <div class="post-content">
              <div class="post-head">
                <span class="post-badge">익명</span>
                <h2>{{ post.title }}</h2>
              </div>
              <p class="post-excerpt">{{ excerpt(post.body) }}</p>
              <div class="post-meta">
                <time>{{ formattedDate(post.createdAt) }}</time>
                <span>조회 {{ post.views }}</span>
                <LikeButton :post-id="post.id" :count="post.likes" compact />
              </div>
            </div>
          </RouterLink>
        </li>
      </ul>

      <div v-else class="empty-state">
        <span class="empty-icon" aria-hidden="true">💬</span>
        <p v-if="query">검색 결과가 없습니다.</p>
        <p v-else>아직 글이 없습니다. 첫 글을 남겨보세요!</p>
        <button class="primary-btn" type="button" @click="goWrite">글 작성하기</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import LikeButton from '@/components/LikeButton.vue'
import { posts } from '@/stores/posts'

const router = useRouter()
const searchText = ref('')
const query = ref('')

const filteredPosts = computed(() => {
  const term = query.value.trim().toLowerCase()
  if (!term) return posts.value
  return posts.value.filter((post) => {
    return (
      post.title.toLowerCase().includes(term) ||
      post.body.toLowerCase().includes(term)
    )
  })
})

function goWrite() {
  router.push({ name: 'post-write' })
}

function applySearch() {
  query.value = searchText.value
}

function excerpt(body) {
  const text = String(body || '').replace(/\s+/g, ' ').trim()
  if (!text) return '내용 없음'
  return text.length > 90 ? `${text.slice(0, 90)}...` : text
}

function formattedDate(value) {
  return new Date(value).toLocaleString('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
</script>

<style scoped>
.board-page {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  min-height: calc(100vh - 80px);
  background: #eaedf2;
  padding: 28px var(--page-inline-padding, 24px) 56px;
}

.board-hero,
.board-toolbar,
.board-list {
  max-width: 960px;
  margin: 0 auto;
}

.board-hero {
  margin-bottom: 20px;
}

.breadcrumb {
  display: flex;
  align-items: center;
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

.board-hero-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  flex-wrap: wrap;
}

.board-hero h1 {
  margin: 0 0 10px;
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  color: #0f172a;
}

.board-description {
  margin: 0 0 14px;
  color: #475569;
  line-height: 1.7;
  max-width: 560px;
}

.feature-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.feature-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: 999px;
  background: #e8f6ff;
  color: #1a5fa0;
}

.card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
}

.board-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 18px 20px;
  margin-bottom: 16px;
}

.toolbar-meta {
  display: flex;
  align-items: baseline;
  gap: 6px;
  color: #475569;
  font-size: 0.92rem;
}

.toolbar-meta strong {
  font-size: 1.2rem;
  color: #0f172a;
}

.search-box {
  display: flex;
  gap: 8px;
  width: 100%;
  max-width: 420px;
}

.search-box input {
  flex: 1;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 11px 14px;
  background: #f8fafc;
  color: #0f172a;
}

.search-box input:focus {
  outline: 2px solid rgba(143, 211, 255, 0.65);
  border-color: #8fd3ff;
  background: #fff;
}

.board-list {
  overflow: hidden;
}

.post-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.post-item + .post-item {
  border-top: 1px solid #f1f5f9;
}

.post-link {
  display: flex;
  gap: 16px;
  padding: 20px 22px;
  text-decoration: none;
  color: inherit;
  transition: background-color 0.15s ease;
}

.post-link:hover {
  background: #f8fafc;
}

.post-number {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 700;
}

.post-content {
  min-width: 0;
  flex: 1;
}

.post-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.post-badge {
  flex-shrink: 0;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 999px;
  background: #e8f6ff;
  color: #1a5fa0;
}

.post-head h2 {
  margin: 0;
  font-size: 1rem;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-link:hover .post-head h2 {
  color: #1a5fa0;
}

.post-excerpt {
  margin: 0 0 10px;
  color: #64748b;
  font-size: 0.88rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  color: #94a3b8;
  font-size: 0.8rem;
}

.post-meta :deep(.like-btn) {
  margin-left: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 56px 24px;
  text-align: center;
}

.empty-icon {
  font-size: 2rem;
}

.empty-state p {
  margin: 0;
  color: #64748b;
}

.primary-btn,
.secondary-btn {
  border: none;
  border-radius: 12px;
  padding: 11px 18px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.primary-btn {
  background: #8fd3ff;
  color: #0f172a;
}

.primary-btn:hover {
  transform: translateY(-1px);
}

.secondary-btn {
  background: #fff;
  color: #334155;
  border: 1px solid #cbd5e1;
}

.secondary-btn:hover {
  background: #f8fafc;
}

@media (max-width: 900px) {
  .board-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: none;
  }
}

@media (max-width: 640px) {
  .board-page {
    padding-bottom: 40px;
  }

  .board-hero-row {
    align-items: stretch;
  }

  .board-hero-row .primary-btn {
    width: 100%;
  }

  .post-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .post-head h2 {
    white-space: normal;
  }

  .post-link {
    padding: 16px;
  }

  .post-number {
    display: none;
  }
}
</style>

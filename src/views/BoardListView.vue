<template>
  <section class="page-section board-page">
    <div class="board-top">
      <div>
        <p class="breadcrumb">홈 / 서울/강남 게시판</p>
        <h1>게시판</h1>
        <p class="board-description">
          익명 게시판입니다. 제목과 내용을 작성하고, 수정/삭제는 비밀번호 검증으로 처리합니다.
        </p>
      </div>

      <div class="board-action-group">
        <button class="button" @click="goWrite">+ 글쓰기</button>
      </div>
    </div>

    <div class="board-tools">
      <div class="search-box">
        <input
    v-model="searchText"
    type="search"
    placeholder="게시글 제목 또는 내용을 검색하세요"
  />
  <button class="button-secondary" type="button" @click="applySearch">
    검색
  </button>
      </div>
    </div>

    <div class="board-table-wrapper">
      <table class="board-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>작성일</th>
            <th>조회수</th>
            <th>좋아요</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(post, index) in filteredPosts" :key="post.id">
            <td>{{ posts.length - index }}</td>
            <td class="title-cell">
              <router-link
                :to="{ name: 'post-detail', params: { id: post.id } }"
              >
                {{ post.title }}
              </router-link>
            </td>
            <td>{{ formattedDate(post.createdAt) }}</td>
            <td>{{ post.views }}</td>
            <td>{{ post.likes }}</td>
          </tr>

          <tr v-if="filteredPosts.length === 0">
            <td colspan="5" class="empty">검색 결과가 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
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

function formattedDate(value) {
  return new Date(value).toLocaleString('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
</script>

<style scoped>
.board-page {
  display: grid;
  gap: 1.5rem;
}

.board-top {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.breadcrumb {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
}

.board-top h1 {
  margin: 0.25rem 0 0.4rem;
  font-size: clamp(2rem, 2.5vw, 2.4rem);
}

.board-description {
  margin: 0;
  color: #475569;
}

.board-action-group {
  display: flex;
  align-items: center;
}

.board-tools {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  gap: 0.5rem;
  width: 100%;
  max-width: 520px;
}

.search-box input {
  flex: 1;
  border-radius: 999px;
  border: 1px solid #cbd5e1;
  padding: 0.95rem 1rem;
  background: #ffffff;
}

.board-table-wrapper {
  overflow-x: auto;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.06);
}

.board-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
}

.board-table th,
.board-table td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
}

.board-table th {
  color: #475569;
  font-weight: 600;
}

.board-table tbody tr:hover {
  background: #f8fafc;
}

.title-cell a {
  color: #0f172a;
  font-weight: 600;
}

.empty {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}
</style>
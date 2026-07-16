<template>
  <div class="post-form-page">
    <div class="form-shell">
      <header class="form-hero">
        <p class="breadcrumb">
          <RouterLink to="/">홈</RouterLink>
          <span aria-hidden="true">/</span>
          <RouterLink to="/board">로컬 이야기</RouterLink>
          <span aria-hidden="true">/</span>
          <span>{{ isEdit ? '게시글 수정' : '글쓰기' }}</span>
        </p>

        <div class="form-hero-row">
          <div class="form-hero-copy">
            <h1>{{ isEdit ? '게시글 수정' : '새 글 작성' }}</h1>
            <p class="form-description">
              {{
                isEdit
                  ? '제목과 내용을 수정한 뒤 저장해주세요.'
                  : ''
              }}
            </p>
          </div>
          <button class="secondary-btn desktop-only" type="button" @click="cancel">
            목록
          </button>
        </div>
      </header>

      <section v-if="!isEdit" class="notice-card">
        <span class="notice-icon" aria-hidden="true">🔒</span>
        <div>
          <strong>익명 게시판 안내</strong>
          <p>로그인 없이 익명으로 글을 남기세요. 작성 시 설정한 비밀번호로만 수정·삭제가 가능합니다.</p>
        </div>
      </section>

      <form class="form-card" @submit.prevent="submitPost">
        <div class="form-row">
          <label for="title">제목</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            maxlength="120"
            placeholder="예) 홍대 근처 조용한 카페 추천"
            required
          />
          <span class="field-hint">{{ form.title.length }}/120</span>
        </div>

        <div class="form-row">
          <label for="body">내용</label>
          <textarea
            id="body"
            v-model="form.body"
            rows="8"
            placeholder="장소, 동선, 팁 등을 자유롭게 적어주세요."
            required
          />
        </div>

        <div v-if="!isEdit" class="form-row">
          <label for="password">비밀번호</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="수정/삭제 시 사용할 비밀번호"
            required
          />
          <span class="field-hint">수정 또는 삭제 시 동일한 비밀번호를 입력해야 합니다.</span>
        </div>

        <div class="form-actions">
          <button class="secondary-btn" type="button" @click="cancel">취소</button>
          <button class="primary-btn" type="submit">
            {{ isEdit ? '수정 완료' : '등록하기' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  createPost,
  updatePost,
  getPostById,
  hasEditAccess,
  revokeEditAccess,
} from '@/stores/posts'

const router = useRouter()
const route = useRoute()

const form = reactive({
  title: '',
  body: '',
  password: '',
})

const isEdit = computed(() => Boolean(route.params.id))

onMounted(() => {
  if (isEdit.value) {
    const postId = route.params.id
    const current = getPostById(postId)
    if (!current) {
      router.push({ name: 'board-list' })
      return
    }
    if (!hasEditAccess(postId)) {
      router.push({ name: 'post-detail', params: { id: postId } })
      return
    }

    form.title = current.title
    form.body = current.body
  }
})

function cancel() {
  if (isEdit.value) {
    revokeEditAccess(route.params.id)
    router.push({ name: 'post-detail', params: { id: route.params.id } })
    return
  }
  router.push({ name: 'board-list' })
}

function submitPost() {
  if (!form.title.trim() || !form.body.trim()) {
    alert('제목과 내용을 모두 입력해주세요.')
    return
  }

  if (isEdit.value) {
    const id = route.params.id
    if (!hasEditAccess(id)) {
      router.push({ name: 'post-detail', params: { id } })
      return
    }
    updatePost(id, {
      title: form.title,
      body: form.body,
    })
    revokeEditAccess(id)
    router.push({ name: 'post-detail', params: { id } })
    return
  }

  if (!form.password.trim()) {
    alert('비밀번호를 입력해주세요.')
    return
  }

  createPost({
    title: form.title,
    body: form.body,
    password: form.password,
  })
  router.push({ name: 'board-list' })
}
</script>

<style scoped>
.post-form-page {
  width: 100%;
  max-width: 100%;
  min-height: calc(100vh - 80px);
  overflow-x: hidden;
  background: #eaedf2;
  padding: 28px var(--page-inline-padding, 24px) 56px;
  box-sizing: border-box;
}

.post-form-page *,
.post-form-page *::before,
.post-form-page *::after {
  box-sizing: border-box;
}

.form-shell {
  width: 100%;
  max-width: 760px;
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

.form-hero-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
}

.form-hero-copy {
  min-width: 0;
  flex: 1;
}

.form-hero h1 {
  margin: 0 0 8px;
  font-size: clamp(1.7rem, 3vw, 2.2rem);
  color: #0f172a;
}

.form-description {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

.notice-card,
.form-card {
  width: 100%;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
}

.notice-card {
  display: flex;
  gap: 14px;
  padding: 16px 18px;
  background: #f8fbff;
  border-color: #cfe8fb;
}

.notice-icon {
  flex-shrink: 0;
  font-size: 1.3rem;
  line-height: 1;
}

.notice-card strong {
  display: block;
  margin-bottom: 4px;
  color: #0f172a;
}

.notice-card p {
  margin: 0;
  color: #475569;
  font-size: 0.9rem;
  line-height: 1.6;
}

.form-card {
  padding: 24px;
  display: grid;
  gap: 20px;
}

.form-row {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.form-row label {
  font-weight: 700;
  color: #0f172a;
  font-size: 0.92rem;
}

.form-row input,
.form-row textarea {
  display: block;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  padding: 12px 14px;
  background: #f8fafc;
  color: #0f172a;
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
}

.form-row input:focus,
.form-row textarea:focus {
  outline: none;
  border-color: #8fd3ff;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(143, 211, 255, 0.35);
}

.form-row textarea {
  min-height: 200px;
  resize: vertical;
  line-height: 1.7;
}

.field-hint {
  color: #64748b;
  font-size: 0.8rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 4px;
}

.primary-btn,
.secondary-btn {
  border-radius: 12px;
  padding: 11px 18px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.primary-btn {
  border: none;
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

@media (max-width: 640px) {
  .post-form-page {
    padding: 20px 16px 40px;
  }

  .form-hero-row {
    align-items: stretch;
  }

  .desktop-only {
    display: none;
  }

  .form-card {
    padding: 18px 16px;
  }

  .form-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .form-actions .primary-btn,
  .form-actions .secondary-btn {
    width: 100%;
  }
}
</style>

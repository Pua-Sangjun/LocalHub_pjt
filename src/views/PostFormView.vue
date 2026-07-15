<template>
  <section class="page-section post-form-page">
    <div class="form-header">
      <div>
        <p class="breadcrumb">
          홈 / 서울/강남 게시판 / {{ isEdit ? '게시글 수정' : '글쓰기' }}
        </p>
        <h1>{{ isEdit ? '게시글 수정' : '새 글 작성' }}</h1>
      </div>

      <button class="button button-secondary" @click="cancel">
        취소
      </button>
    </div>

    <div class="form-card">
      <div class="form-row">
        <label for="title">제목</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          placeholder="제목을 입력하세요"
        />
      </div>

      <div class="form-row">
        <label for="body">내용</label>
        <textarea
          id="body"
          v-model="form.body"
          placeholder="내용을 입력하세요"
        />
      </div>

      <div class="form-row">
        <label for="password">비밀번호</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          placeholder="수정/삭제 시 사용할 비밀번호"
        />
        <small>수정 또는 삭제 시 동일한 비밀번호를 입력해야 합니다.</small>
      </div>

      <div class="form-actions">
        <button class="button-secondary" type="button" @click="cancel">
          취소
        </button>
        <button class="button" type="button" @click="submitPost">
          {{ isEdit ? '수정 완료' : '등록하기' }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  createPost,
  updatePost,
  getPostById,
  validatePostPassword,
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
    const current = getPostById(route.params.id)
    if (!current) {
      router.push({ name: 'board-list' })
      return
    }

    form.title = current.title
    form.body = current.body
  }
})

function cancel() {
  router.push({ name: 'board-list' })
}

function submitPost() {
  if (!form.title.trim() || !form.body.trim() || !form.password.trim()) {
    alert('제목, 내용, 비밀번호를 모두 입력해주세요.')
    return
  }

  if (isEdit.value) {
    const id = route.params.id
    if (!validatePostPassword(id, form.password)) {
      alert('비밀번호가 일치하지 않습니다.')
      return
    }
    updatePost(id, {
      title: form.title,
      body: form.body,
    })
    router.push({ name: 'post-detail', params: { id } })
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
  display: grid;
  gap: 1.5rem;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}

.form-header h1 {
  margin: 0.3rem 0 0;
  font-size: clamp(2rem, 2.5vw, 2.4rem);
}

.form-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  padding: 1.75rem;
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.06);
  display: grid;
  gap: 1.25rem;
}

.form-row {
  display: grid;
  gap: 0.6rem;
}

.form-row label {
  font-weight: 700;
  color: #0f172a;
}

.form-row small {
  color: #64748b;
}

input,
textarea {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 16px;
  padding: 1rem 1.1rem;
  background: #f8fafc;
  color: #0f172a;
  font-size: 1rem;
}

textarea {
  min-height: 220px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}
</style>
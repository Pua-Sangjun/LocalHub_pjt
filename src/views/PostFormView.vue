<template>
  <section class="page-section">
    <div class="page-header">
      <div>
        <h1>{{ isEdit ? '게시글 수정' : '새 글 작성' }}</h1>
        <p>{{ isEdit ? '작성 시 입력한 비밀번호로 수정합니다.' : '익명으로 지역 정보를 나누어보세요.' }}</p>
      </div>
      <button class="button button-secondary" @click="cancel">목록으로 돌아가기</button>
    </div>

    <div class="panel">
      <div class="input-group">
        <label for="title">제목</label>
        <input id="title" v-model="form.title" type="text" placeholder="제목을 입력하세요" />
      </div>

      <div class="input-group">
        <label for="body">내용</label>
        <textarea id="body" v-model="form.body" placeholder="내용을 입력하세요"></textarea>
      </div>

      <div class="input-group">
        <label for="password">비밀번호</label>
        <input id="password" v-model="form.password" type="password" placeholder="비밀번호를 입력하세요" />
      </div>

      <div class="field-row" style="justify-content:flex-end; gap:0.75rem;">
        <button class="button button-secondary" type="button" @click="cancel">취소</button>
        <button class="button" type="button" @click="submitPost">{{ isEdit ? '수정 완료' : '등록하기' }}</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createPost, updatePost, getPostById, validatePostPassword } from '@/stores/posts'

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

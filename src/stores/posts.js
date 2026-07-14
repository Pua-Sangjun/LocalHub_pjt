import { ref, watch } from 'vue'

const STORAGE_KEY = 'localhub-posts'

function normalizePost(post) {
  return {
    id: String(post.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`),
    title: String(post.title ?? ''),
    body: String(post.body ?? ''),
    author: String(post.author ?? '익명'),
    password: String(post.password ?? ''),
    createdAt: post.createdAt || new Date().toISOString(),
    views: Number(post.views ?? 0),
    likes: Number(post.likes ?? 0),
  }
}

function loadPosts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizePost)
  } catch {
    return []
  }
}

const posts = ref(loadPosts())

watch(
  posts,
  () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts.value))
  },
  { deep: true }
)

export { posts }

export function getPosts() {
  return posts.value
}

export function getPostById(id) {
  return posts.value.find((item) => item.id === id)
}

export function createPost({ title, body, password }) {
  const newPost = normalizePost({
    title,
    body,
    password,
    views: 0,
    likes: 0,
    createdAt: new Date().toISOString(),
  })
  posts.value = [newPost, ...posts.value]
  return newPost
}

export function updatePost(id, { title, body }) {
  const index = posts.value.findIndex((item) => item.id === id)
  if (index < 0) return null
  posts.value[index] = {
    ...posts.value[index],
    title,
    body,
  }
  return posts.value[index]
}

export function validatePostPassword(id, password) {
  const post = getPostById(id)
  return post && post.password === password
}

export function deletePost(id) {
  posts.value = posts.value.filter((item) => item.id !== id)
}

export function incrementViews(id) {
  const post = getPostById(id)
  if (post) {
    post.views += 1
  }
}

export function toggleLike(id) {
  const post = getPostById(id)
  if (post) {
    post.likes += 1
  }
}

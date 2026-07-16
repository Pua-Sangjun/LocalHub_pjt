import { ref, watch } from 'vue'

const STORAGE_KEY = 'localhub-posts'
const LIKED_KEY = 'localhub-liked-posts'

function loadLikedIds() {
  try {
    const stored = localStorage.getItem(LIKED_KEY)
    if (!stored) return new Set()
    const parsed = JSON.parse(stored)
    return new Set(Array.isArray(parsed) ? parsed.map(String) : [])
  } catch {
    return new Set()
  }
}

const likedPostIds = ref(loadLikedIds())

function saveLikedIds() {
  localStorage.setItem(LIKED_KEY, JSON.stringify([...likedPostIds.value]))
}

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
    return parsed
      .filter((post) => !String(post.id ?? '').startsWith('seed-'))
      .map(normalizePost)
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

function editAccessKey(id) {
  return `localhub-edit-${id}`
}

export function grantEditAccess(id) {
  sessionStorage.setItem(editAccessKey(id), '1')
}

export function hasEditAccess(id) {
  return sessionStorage.getItem(editAccessKey(id)) === '1'
}

export function revokeEditAccess(id) {
  sessionStorage.removeItem(editAccessKey(id))
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

export function isPostLiked(id) {
  return likedPostIds.value.has(String(id))
}

export function toggleLike(id) {
  const post = getPostById(id)
  if (!post) return false

  const key = String(id)
  const alreadyLiked = likedPostIds.value.has(key)

  if (alreadyLiked) {
    likedPostIds.value.delete(key)
    post.likes = Math.max(0, post.likes - 1)
  } else {
    likedPostIds.value.add(key)
    post.likes += 1
  }

  likedPostIds.value = new Set(likedPostIds.value)
  saveLikedIds()
  return !alreadyLiked
}

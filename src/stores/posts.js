import { ref, watch } from 'vue'

const STORAGE_KEY = 'localhub-posts'

const DEFAULT_POSTS = [
  {
    id: 'seed-1',
    title: '강남 코엑스·봉은사 주변 산책 코스 공유',
    body: '삼성역에서 코엑스 들렀다가 봉은사까지 걸었어요. 저녁에 가면 조용하고 좋습니다.',
    author: '강남토박이',
    password: '',
    createdAt: '2026-07-14T10:00:00.000Z',
    views: 42,
    likes: 7,
  },
  {
    id: 'seed-2',
    title: '압구정·청담 갤러리 투어 후기',
    body: '가로수길에서 청담까지 갤러리 위주로 돌았습니다. 주말 오후에 여유롭게 보기 좋아요.',
    author: '서울산책러',
    password: '',
    createdAt: '2026-07-13T15:30:00.000Z',
    views: 88,
    likes: 15,
  },
  {
    id: 'seed-3',
    title: '남산타워 꿀주차 구역 조용히 풉니다',
    body: '남산케이블카 근처 주차 정보입니다. 평일 오전이면 비교적 여유 있습니다.',
    author: '익명',
    password: '',
    createdAt: '2026-07-15T09:00:00.000Z',
    views: 21,
    likes: 4,
  },
  {
    id: 'seed-4',
    title: '이번 주말 반포한강공원 야시장 가시는 분?',
    body: '토요일 저녁에 반포 한강공원 야시장 같이 돌 분 구해요.',
    author: '주말러',
    password: '',
    createdAt: '2026-07-14T18:00:00.000Z',
    views: 12,
    likes: 2,
  },
]

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
    if (!stored) return DEFAULT_POSTS.map(normalizePost)
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_POSTS.map(normalizePost)
    return parsed.map(normalizePost)
  } catch {
    return DEFAULT_POSTS.map(normalizePost)
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

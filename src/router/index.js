import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import BoardListView from '@/views/BoardListView.vue'
import PostDetailView from '@/views/PostDetailView.vue'
import PostFormView from '@/views/PostFormView.vue'
import MapView from '@/views/MapView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/board', name: 'board-list', component: BoardListView },
  { path: '/board/write', name: 'post-write', component: PostFormView },
  { path: '/board/:id', name: 'post-detail', component: PostDetailView },
  { path: '/board/:id/edit', name: 'post-edit', component: PostFormView },
  { path: '/map', name: 'map', component: MapView },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
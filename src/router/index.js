import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import HomeView from '@/views/HomeView.vue'
import AttractionsView from '@/views/AttractionsView.vue'
import BoardListView from '@/views/BoardListView.vue'
import PostDetailView from '@/views/PostDetailView.vue'
import PostFormView from '@/views/PostFormView.vue'
import MapView from '@/views/MapView.vue'

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '', name: 'home', component: HomeView, meta: { header: 'hero' } },
      {
        path: 'attractions',
        name: 'attractions',
        component: AttractionsView,
        meta: { header: 'solid' },
      },
      {
        path: 'board',
        name: 'board-list',
        component: BoardListView,
        meta: { header: 'solid' },
      },
      {
        path: 'board/write',
        name: 'post-write',
        component: PostFormView,
        meta: { header: 'solid' },
      },
      {
        path: 'board/:id',
        name: 'post-detail',
        component: PostDetailView,
        meta: { header: 'solid' },
      },
      {
        path: 'board/:id/edit',
        name: 'post-edit',
        component: PostFormView,
        meta: { header: 'solid' },
      },
      { path: 'map', name: 'map', component: MapView, meta: { header: 'solid' } },
    ],
  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth', top: 96 }
    }
    return { top: 0 }
  },
})

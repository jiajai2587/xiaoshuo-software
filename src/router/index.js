import { createRouter, createWebHashHistory } from 'vue-router'
import { useCardStore } from '@/stores/cardStore'

const routes = [
  {
    path: '/',
    redirect: '/card-verify'
  },
  {
    path: '/card-verify',
    name: 'CardVerify',
    component: () => import('@/views/CardVerifyView.vue')
  },
  {
    path: '/card-admin',
    name: 'CardAdmin',
    component: () => import('@/views/CardAdminView.vue')
  },
  {
    path: '/project',
    name: 'Project',
    component: () => import('@/views/ProjectView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/outline',
    name: 'Outline',
    component: () => import('@/views/OutlineView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/generate',
    name: 'Generate',
    component: () => import('@/views/GenerateView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/progress',
    name: 'Progress',
    component: () => import('@/views/ProgressView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/browser',
    name: 'Browser',
    component: () => import('@/views/BrowserView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/api',
    name: 'API',
    component: () => import('@/views/APIView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('@/views/ContactView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const cardStore = useCardStore()
  
  if (!cardStore.isActivated) {
    cardStore.loadActivation()
  }
  
  if (to.meta.requiresAuth) {
    if (!cardStore.isActivated || cardStore.isExpired) {
      next('/card-verify')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router

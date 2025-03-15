import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'
import UserListView from '@/views/users/UserListView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: '',
          redirect: '/dashboard'
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardView
        },
        {
          path: 'users',
          name: 'users',
          component: UserListView,
          meta: {
            requiresAdmin: true
          }
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('@/views/products/ProductListView.vue')
        },
        {
          path: 'orders',
          name: 'orders',
          component: () => import('@/views/orders/OrderListView.vue')
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/profile/ProfileView.vue')
        },
        {
          path: 'change-password',
          name: 'changePassword',
          component: () => import('@/views/profile/ChangePasswordView.vue')
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/settings/SettingsView.vue'),
          meta: {
            requiresAdmin: true
          }
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        requiresGuest: true
      }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: {
        requiresGuest: true
      }
    }
  ]
})

// 路由守衛
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userStore = useUserStore()
  
  // 需要訪客權限的頁面（如登入、註冊）
  if (to.meta.requiresGuest && userStore.isLoggedIn) {
    return next('/dashboard')
  }

  // 需要登入權限的頁面
  if (to.meta.requiresAuth && !token) {
    return next('/login')
  }

  // 需要管理員權限的頁面
  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    return next('/dashboard')
  }

  next()
})

export default router
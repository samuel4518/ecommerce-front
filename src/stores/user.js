import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 從本地存儲初始化用戶數據
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const token = ref(localStorage.getItem('token') || '')

  // 計算屬性
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const username = computed(() => user.value?.username || '')
  const permissions = computed(() => user.value?.permissions || [])

  const setUser = (userData) => {
    user.value = userData
    // 保存用戶數據到本地存儲
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const setToken = (tokenValue) => {
    token.value = tokenValue
    localStorage.setItem('token', tokenValue)
  }

  const clearAuth = () => {
    user.value = null
    token.value = ''
    // 清除本地存儲
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const hasPermission = (permission) => {
    if (!user.value) return false
    if (isAdmin.value) return true
    return permissions.value.includes(permission)
  }

  return {
    user,
    token,
    isLoggedIn,
    isAdmin,
    username,
    permissions,
    setUser,
    setToken,
    clearAuth,
    hasPermission
  }
}) 
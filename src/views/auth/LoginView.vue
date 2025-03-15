<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="text-center mb-4">登入系統</h2>
      <el-form 
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        label-position="top"
      >
        <el-form-item label="使用者帳號" prop="username">
          <el-input 
            v-model="loginForm.username"
            placeholder="請輸入使用者帳號"
          />
        </el-form-item>
        
        <el-form-item label="密碼" prop="password">
          <el-input 
            v-model="loginForm.password"
            type="password"
            placeholder="請輸入密碼"
            show-password
          />
        </el-form-item>

        <div class="flex justify-between mb-4">
          <el-checkbox v-model="loginForm.remember">記住我</el-checkbox>
          <el-link type="primary" href="#" @click="forgotPassword">忘記密碼？</el-link>
        </div>

        <el-button type="primary" class="w-100" @click="handleLogin" :loading="loading">
          {{ loading ? '登入中...' : '登入' }}
        </el-button>

        <div class="divider">
          <span>或</span>
        </div>

        <el-button class="w-100 google-btn" @click="handleGoogleLogin" :loading="googleLoading">
          <template v-if="!googleLoading">
            <img src="@/assets/google-icon.svg" alt="Google" class="google-icon" />
            使用 Google 帳戶登入
          </template>
          <template v-else>
            登入中...
          </template>
        </el-button>

        <div class="text-center mt-4">
          還沒有帳號？
          <el-link type="primary" href="#" @click="goToRegister">立即註冊</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const googleLoading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const rules = {
  username: [
    { required: true, message: '請輸入使用者帳號', trigger: 'blur' },
    { min: 3, message: '帳號長度至少為 3 個字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 6, message: '密碼長度至少為 6 個字符', trigger: 'blur' }
  ]
}

const formRef = ref(null)

const handleLogin = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true

    // 超級管理者帳號驗證
    if (loginForm.username === 'admin' && loginForm.password === 'test99999') {
      // 設置模擬的用戶數據
      const userData = {
        id: 1,
        name: '超級管理者',
        username: 'admin',
        role: 'admin',
        permissions: ['user.manage', 'system.manage', 'product.manage', 'order.manage', 'report.manage'],
        last_login: new Date().toISOString()
      }
      
      // 設置模擬的 token
      const token = 'admin-token-' + Date.now()
      
      // 更新 store
      userStore.setUser(userData)
      userStore.setToken(token)

      ElMessage.success('登入成功')
      router.push('/dashboard')
    } else {
      ElMessage.error('帳號或密碼錯誤')
    }
  } catch (error) {
    console.error('表單驗證失敗:', error)
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = async () => {
  try {
    googleLoading.value = true
    // TODO: 實現 Google 登入邏輯
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模擬 API 請求
    ElMessage.success('Google 登入成功')
    router.push('/dashboard')
  } catch (error) {
    console.error('Google 登入失敗:', error)
    ElMessage.error('Google 登入失敗，請稍後再試')
  } finally {
    googleLoading.value = false
  }
}

const forgotPassword = () => {
  router.push('/auth/forgot-password')
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color);
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.w-100 {
  width: 100%;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1rem 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--border-color);
}

.divider span {
  padding: 0 1rem;
  color: #909399;
  font-size: 14px;
}

.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #fff;
  border: 1px solid var(--border-color);
  color: #333;
}

.google-btn:hover {
  background-color: #f5f5f5;
}

.google-icon {
  width: 18px;
  height: 18px;
}
</style> 
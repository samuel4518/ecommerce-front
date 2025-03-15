<template>
  <div class="register-container">
    <div class="register-card">
      <h2 class="text-center mb-4">註冊帳號</h2>
      <el-form 
        ref="formRef"
        :model="registerForm"
        :rules="rules"
        label-position="top"
      >
        <el-form-item label="使用者帳號" prop="username">
          <el-input 
            v-model="registerForm.username"
            placeholder="請輸入使用者帳號"
          />
        </el-form-item>

        <el-form-item label="姓名" prop="name">
          <el-input 
            v-model="registerForm.name"
            placeholder="請輸入姓名"
          />
        </el-form-item>
        
        <el-form-item label="密碼" prop="password">
          <el-input 
            v-model="registerForm.password"
            type="password"
            placeholder="請輸入密碼"
            show-password
          />
        </el-form-item>

        <el-form-item label="確認密碼" prop="confirmPassword">
          <el-input 
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="請再次輸入密碼"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="registerForm.agreeToTerms" class="mb-4">
            我同意<el-link type="primary" @click.prevent="showTermsDialog">服務條款</el-link>
          </el-checkbox>
        </el-form-item>

        <el-button type="primary" class="w-100" @click="handleRegister" :loading="loading">
          註冊
        </el-button>

        <div class="text-center mt-4">
          已經有帳號？
          <el-link type="primary" href="#" @click="goToLogin">立即登入</el-link>
        </div>
      </el-form>
    </div>
    <TermsDialog
      v-model:visible="termsDialogVisible"
      @agree="handleAgreeTerms"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import TermsDialog from '@/components/auth/TermsDialog.vue'

const router = useRouter()
const loading = ref(false)
const termsDialogVisible = ref(false)

const registerForm = reactive({
  username: '',
  name: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false
})

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('請輸入密碼'))
  } else {
    if (registerForm.confirmPassword !== '') {
      formRef.value?.validateField('confirmPassword')
    }
    callback()
  }
}

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('請再次輸入密碼'))
  } else if (value !== registerForm.password) {
    callback(new Error('兩次輸入的密碼不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '請輸入使用者帳號', trigger: 'blur' },
    { min: 3, message: '帳號長度至少為 3 個字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '請輸入姓名', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, message: '密碼長度至少為 6 個字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ]
}

const formRef = ref(null)

const handleRegister = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    
    if (!registerForm.agreeToTerms) {
      ElMessage.warning('請同意服務條款')
      return
    }

    loading.value = true
    // TODO: 實現註冊邏輯
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模擬 API 請求
    ElMessage.success('註冊成功')
    router.push('/login')
  } catch (error) {
    console.error('表單驗證失敗:', error)
  } finally {
    loading.value = false
  }
}

const showTermsDialog = () => {
  termsDialogVisible.value = true
}

const handleAgreeTerms = () => {
  registerForm.agreeToTerms = true
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color);
  padding: 1rem;
}

.register-card {
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

.mb-4 {
  margin-bottom: 1rem;
}

.mt-4 {
  margin-top: 1rem;
}

.text-center {
  text-align: center;
}
</style> 
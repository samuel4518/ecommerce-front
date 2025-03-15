<template>
  <div class="change-password-container">
    <!-- 頁面標題 -->
    <div class="page-header">
      <div class="header-content">
        <h2>修改密碼</h2>
      </div>
    </div>

    <el-row :gutter="20" justify="center">
      <el-col :xs="24" :sm="16" :md="12" :lg="8">
        <el-card class="password-card">
          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="120px"
            label-position="right"
            @submit.prevent="handleSubmit"
          >
            <el-form-item label="目前密碼" prop="currentPassword">
              <el-input
                v-model="form.currentPassword"
                type="password"
                show-password
                placeholder="請輸入目前密碼"
              />
            </el-form-item>

            <el-form-item label="新密碼" prop="newPassword">
              <el-input
                v-model="form.newPassword"
                type="password"
                show-password
                placeholder="請輸入新密碼"
              />
            </el-form-item>

            <el-form-item label="確認新密碼" prop="confirmPassword">
              <el-input
                v-model="form.confirmPassword"
                type="password"
                show-password
                placeholder="請再次輸入新密碼"
              />
            </el-form-item>

            <div class="password-tips">
              <h4>密碼要求：</h4>
              <ul>
                <li>長度至少 8 個字符</li>
                <li>至少包含一個大寫字母</li>
                <li>至少包含一個小寫字母</li>
                <li>至少包含一個數字</li>
              </ul>
            </div>

            <el-form-item>
              <div class="button-group">
                <el-button @click="goBack">返回</el-button>
                <el-button type="primary" @click="handleSubmit" :loading="loading">
                  確認修改
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

// 表單數據
const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 驗證新密碼
const validateNewPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('請輸入新密碼'))
  } else if (value.length < 8) {
    callback(new Error('密碼長度至少為 8 個字符'))
  } else if (!/[A-Z]/.test(value)) {
    callback(new Error('密碼需要包含大寫字母'))
  } else if (!/[a-z]/.test(value)) {
    callback(new Error('密碼需要包含小寫字母'))
  } else if (!/\d/.test(value)) {
    callback(new Error('密碼需要包含數字'))
  } else if (value === form.currentPassword) {
    callback(new Error('新密碼不能與目前密碼相同'))
  } else {
    if (form.confirmPassword) {
      formRef.value?.validateField('confirmPassword')
    }
    callback()
  }
}

// 驗證確認密碼
const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('請再次輸入新密碼'))
  } else if (value !== form.newPassword) {
    callback(new Error('兩次輸入的密碼不一致'))
  } else {
    callback()
  }
}

// 表單驗證規則
const rules = {
  currentPassword: [
    { required: true, message: '請輸入目前密碼', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, validator: validateNewPassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 提交表單
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true
    
    // TODO: 調用 API 更新密碼
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('密碼修改成功，請重新登入')
    router.push('/login')
  } catch (error) {
    console.error('表單驗證失敗:', error)
  } finally {
    loading.value = false
  }
}

// 返回上一頁
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.change-password-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.header-content h2 {
  margin: 0;
  font-size: 24px;
}

.password-card {
  margin-bottom: 20px;
}

.password-tips {
  margin: 20px 0;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.password-tips h4 {
  margin: 0 0 10px 0;
  color: #606266;
}

.password-tips ul {
  margin: 0;
  padding-left: 20px;
  color: #909399;
}

.password-tips li {
  margin-bottom: 5px;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .change-password-container {
    padding: 10px;
  }

  .el-form-item {
    margin-bottom: 20px;
  }
}
</style> 
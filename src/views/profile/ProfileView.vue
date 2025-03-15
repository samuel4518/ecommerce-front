<template>
  <div class="profile-container">
    <!-- 頁面標題 -->
    <div class="page-header">
      <div class="header-content">
        <h2>個人資料</h2>
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 左側個人資料卡片 -->
      <el-col :xs="24" :sm="8">
        <el-card class="profile-card">
          <div class="user-info text-center">
            <h3>{{ userInfo.name }}</h3>
            <p class="text-muted">{{ userInfo.role === 'admin' ? '管理員' : '一般用戶' }}</p>
          </div>
          <div class="info-list">
            <div class="info-item">
              <span class="label">帳號：</span>
              <span class="value">{{ userInfo.username }}</span>
            </div>
            <div class="info-item">
              <span class="label">最後登入：</span>
              <span class="value">{{ formatDate(userInfo.lastLogin) }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右側編輯表單 -->
      <el-col :xs="24" :sm="16">
        <el-card class="edit-form-card">
          <template #header>
            <div class="card-header">
              <h3>編輯資料</h3>
            </div>
          </template>

          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="100px"
            label-position="right"
          >
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>

            <el-form-item label="手機" prop="phone">
              <el-input v-model="form.phone" />
            </el-form-item>

            <el-form-item label="生日" prop="birthday">
              <el-date-picker
                v-model="form.birthday"
                type="date"
                placeholder="選擇日期"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="性別" prop="gender">
              <el-radio-group v-model="form.gender">
                <el-radio label="male">男</el-radio>
                <el-radio label="female">女</el-radio>
                <el-radio label="other">其他</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="地址" prop="address">
              <el-input
                v-model="form.address"
                type="textarea"
                :rows="2"
              />
            </el-form-item>

            <el-form-item label="個人簡介" prop="bio">
              <el-input
                v-model="form.bio"
                type="textarea"
                :rows="4"
                placeholder="介紹一下你自己..."
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleSubmit" :loading="loading">
                儲存變更
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 安全設定卡片 -->
        <el-card class="security-card">
          <template #header>
            <div class="card-header">
              <h3>安全設定</h3>
            </div>
          </template>

          <div class="security-items">
            <div class="security-item">
              <div class="security-info">
                <h4>密碼</h4>
                <p class="text-muted">建議定期更換密碼，確保帳號安全</p>
              </div>
              <el-button @click="goToChangePassword">修改密碼</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

// 用戶基本信息
const userInfo = reactive({
  name: userStore.user?.name || '',
  username: userStore.user?.username || '',
  role: userStore.user?.role || 'user',
  lastLogin: userStore.user?.last_login || new Date()
})

// 編輯表單數據
const form = reactive({
  name: userInfo.name,
  phone: '',
  birthday: '',
  gender: 'male',
  address: '',
  bio: ''
})

// 表單驗證規則
const rules = {
  name: [
    { required: true, message: '請輸入姓名', trigger: 'blur' },
    { min: 2, message: '長度至少為 2 個字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^09\d{8}$/, message: '請輸入正確的手機號碼格式', trigger: 'blur' }
  ]
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 提交表單
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true
    
    // TODO: 調用 API 更新用戶資料
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('資料更新成功')
  } catch (error) {
    console.error('更新失敗:', error)
  } finally {
    loading.value = false
  }
}

// 重置表單
const resetForm = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
}

// 前往修改密碼頁面
const goToChangePassword = () => {
  router.push('/change-password')
}

onMounted(() => {
  // TODO: 獲取用戶詳細資料
})
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.header-content h2 {
  margin: 0;
  font-size: 24px;
}

.profile-card {
  margin-bottom: 20px;
}

.text-center {
  text-align: center;
}

.text-muted {
  color: #909399;
  font-size: 14px;
}

.info-list {
  margin-top: 20px;
}

.info-item {
  display: flex;
  margin-bottom: 10px;
}

.info-item .label {
  color: #909399;
  width: 80px;
}

.info-item .value {
  flex: 1;
}

.edit-form-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.security-card {
  margin-bottom: 20px;
}

.security-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.security-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
}

.security-info p {
  margin: 0;
}

.mt-3 {
  margin-top: 12px;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .el-form-item {
    margin-bottom: 20px;
  }

  .security-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .security-info {
    margin-bottom: 10px;
  }
}
</style> 
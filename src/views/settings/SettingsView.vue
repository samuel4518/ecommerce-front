<template>
  <div class="settings-container">
    <!-- 頁面標題 -->
    <div class="page-header">
      <div class="header-content">
        <h2>系統設定</h2>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="24">
        <!-- 基本設定 -->
        <el-card class="setting-card">
          <template #header>
            <div class="card-header">
              <h3>基本設定</h3>
            </div>
          </template>
          
          <el-form
            ref="formRef"
            :model="settingsForm"
            :rules="rules"
            label-width="180px"
            label-position="right"
          >
            <el-form-item label="系統名稱" prop="systemName">
              <el-input v-model="settingsForm.systemName" />
            </el-form-item>

            <el-form-item label="每頁顯示數量" prop="pageSize">
              <el-select v-model="settingsForm.pageSize" style="width: 200px">
                <el-option label="10 筆" :value="10" />
                <el-option label="20 筆" :value="20" />
                <el-option label="50 筆" :value="50" />
                <el-option label="100 筆" :value="100" />
              </el-select>
            </el-form-item>

            <el-form-item label="啟用系統通知" prop="enableNotification">
              <el-switch v-model="settingsForm.enableNotification" />
            </el-form-item>

            <el-form-item label="系統維護模式" prop="maintenanceMode">
              <el-switch v-model="settingsForm.maintenanceMode" />
            </el-form-item>

            <el-form-item label="維護說明" prop="maintenanceMessage" v-if="settingsForm.maintenanceMode">
              <el-input
                v-model="settingsForm.maintenanceMessage"
                type="textarea"
                :rows="3"
                placeholder="請輸入系統維護說明"
              />
            </el-form-item>
          </el-form>

          <div class="button-group">
            <el-button type="primary" @click="handleSubmit" :loading="loading">
              儲存設定
            </el-button>
            <el-button @click="resetForm">重置</el-button>
          </div>
        </el-card>

        <!-- 系統資訊 -->
        <el-card class="setting-card">
          <template #header>
            <div class="card-header">
              <h3>系統資訊</h3>
            </div>
          </template>

          <div class="info-list">
            <div class="info-item">
              <span class="label">系統版本：</span>
              <span class="value">1.0.0</span>
            </div>
            <div class="info-item">
              <span class="label">最後更新時間：</span>
              <span class="value">{{ formatDate(new Date()) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Node.js 版本：</span>
              <span class="value">v18.0.0</span>
            </div>
            <div class="info-item">
              <span class="label">Vue 版本：</span>
              <span class="value">3.4.15</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const formRef = ref(null)

// 表單數據
const settingsForm = reactive({
  systemName: '產品管理系統',
  pageSize: 20,
  enableNotification: true,
  maintenanceMode: false,
  maintenanceMessage: ''
})

// 表單驗證規則
const rules = {
  systemName: [
    { required: true, message: '請輸入系統名稱', trigger: 'blur' },
    { min: 2, max: 50, message: '長度需在 2 到 50 個字符之間', trigger: 'blur' }
  ],
  pageSize: [
    { required: true, message: '請選擇每頁顯示數量', trigger: 'change' }
  ],
  maintenanceMessage: [
    { required: true, message: '請輸入維護說明', trigger: 'blur', when: (form) => form.maintenanceMode }
  ]
}

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 提交表單
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true
    
    // TODO: 調用 API 保存設定
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('設定已更新')
  } catch (error) {
    console.error('表單驗證失敗:', error)
  } finally {
    loading.value = false
  }
}

// 重置表單
const resetForm = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
}
</script>

<style scoped>
.settings-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.header-content h2 {
  margin: 0;
  font-size: 24px;
}

.setting-card {
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

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item .label {
  width: 180px;
  color: #606266;
}

.info-item .value {
  color: #303133;
  font-weight: 500;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .settings-container {
    padding: 10px;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .info-item .label {
    width: 100%;
  }
}
</style> 
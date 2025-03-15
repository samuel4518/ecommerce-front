<template>
  <div class="user-list-container">
    <!-- 頁面標題和操作按鈕 -->
    <div class="page-header">
      <div class="header-content">
        <h2>用戶管理</h2>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增用戶
        </el-button>
      </div>
      
      <!-- 搜索和篩選 -->
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索用戶名稱或帳號"
          class="search-input"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select v-model="roleFilter" placeholder="角色篩選" clearable @change="handleSearch">
          <el-option label="管理員" value="admin" />
          <el-option label="一般用戶" value="user" />
        </el-select>
        
        <el-select v-model="statusFilter" placeholder="狀態篩選" clearable @change="handleSearch">
          <el-option label="啟用" value="active" />
          <el-option label="停用" value="inactive" />
        </el-select>
      </div>
    </div>

    <!-- 用戶列表 -->
    <el-table
      v-loading="loading"
      :data="userList"
      style="width: 100%"
      row-key="id"
    >
      <el-table-column prop="username" label="帳號" min-width="120" />
      <el-table-column prop="name" label="姓名" min-width="120" />
      <el-table-column prop="role" label="角色" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'info'">
            {{ scope.row.role === 'admin' ? '管理員' : '一般用戶' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="狀態" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
            {{ scope.row.status === 'active' ? '啟用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="last_login" label="最後登入時間" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.last_login) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button-group>
            <el-button
              type="primary"
              :icon="Edit"
              @click="handleEdit(scope.row)"
              title="編輯"
            />
            <el-button
              :type="scope.row.status === 'active' ? 'danger' : 'success'"
              :icon="scope.row.status === 'active' ? CircleClose : CircleCheck"
              @click="handleToggleStatus(scope.row)"
              :title="scope.row.status === 'active' ? '停用' : '啟用'"
            />
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分頁 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 用戶表單對話框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增用戶' : '編輯用戶'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="userForm"
        :rules="rules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="帳號" prop="username">
          <el-input v-model="userForm.username" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userForm.name" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" style="width: 100%">
            <el-option label="管理員" value="admin" />
            <el-option label="一般用戶" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="密碼" prop="password" v-if="dialogType === 'add'">
          <el-input v-model="userForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="確認密碼" prop="confirmPassword" v-if="dialogType === 'add'">
          <el-input v-model="userForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          確認
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Plus,
  Edit,
  CircleCheck,
  CircleClose
} from '@element-plus/icons-vue'

// 狀態
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const dialogType = ref('add')
const searchQuery = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 表單相關
const formRef = ref(null)
const userForm = reactive({
  username: '',
  name: '',
  role: 'user',
  password: '',
  confirmPassword: ''
})

// 表單驗證規則
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('請輸入密碼'))
  } else {
    if (userForm.confirmPassword !== '') {
      formRef.value?.validateField('confirmPassword')
    }
    callback()
  }
}

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('請再次輸入密碼'))
  } else if (value !== userForm.password) {
    callback(new Error('兩次輸入的密碼不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '請輸入帳號', trigger: 'blur' },
    { min: 3, message: '帳號長度至少為 3 個字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '請輸入姓名', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '請選擇角色', trigger: 'change' }
  ],
  password: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, message: '密碼長度至少為 6 個字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ]
}

// 模擬的用戶數據
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    name: '超級管理者',
    role: 'admin',
    status: 'active',
    last_login: '2024-01-20 15:30:00'
  },
  {
    id: 2,
    username: 'user1',
    name: '張小明',
    role: 'user',
    status: 'active',
    last_login: '2024-01-19 10:15:00'
  },
  {
    id: 3,
    username: 'user2',
    name: '王大華',
    role: 'user',
    status: 'inactive',
    last_login: '2024-01-18 09:20:00'
  },
  {
    id: 4,
    username: 'manager1',
    name: '李管理',
    role: 'admin',
    status: 'active',
    last_login: '2024-01-17 14:20:00'
  },
  {
    id: 5,
    username: 'user3',
    name: '陳小華',
    role: 'user',
    status: 'inactive',
    last_login: '2024-01-16 11:30:00'
  }
]

// 過濾後的用戶列表
const userList = computed(() => {
  let filteredUsers = [...mockUsers]

  // 搜索條件過濾
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filteredUsers = filteredUsers.filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.name.toLowerCase().includes(query)
    )
  }

  // 角色過濾
  if (roleFilter.value) {
    filteredUsers = filteredUsers.filter(user => user.role === roleFilter.value)
  }

  // 狀態過濾
  if (statusFilter.value) {
    filteredUsers = filteredUsers.filter(user => user.status === statusFilter.value)
  }

  // 更新總數
  total.value = filteredUsers.length

  // 分頁處理
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredUsers.slice(start, end)
})

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

// 處理新增用戶
const handleAdd = () => {
  dialogType.value = 'add'
  userForm.username = ''
  userForm.name = ''
  userForm.role = 'user'
  userForm.password = ''
  userForm.confirmPassword = ''
  dialogVisible.value = true
}

// 處理編輯用戶
const handleEdit = (row) => {
  dialogType.value = 'edit'
  userForm.username = row.username
  userForm.name = row.name
  userForm.role = row.role
  dialogVisible.value = true
}

// 處理切換用戶狀態
const handleToggleStatus = async (row) => {
  try {
    await ElMessageBox.confirm(
      `確定要${row.status === 'active' ? '停用' : '啟用'}該用戶嗎？`,
      '提示',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // TODO: 調用 API 更新用戶狀態
    row.status = row.status === 'active' ? 'inactive' : 'active'
    ElMessage.success('更新成功')
  } catch (error) {
    console.error('更新失敗:', error)
  }
}

// 處理表單提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    // TODO: 調用 API 保存用戶數據
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success(dialogType.value === 'add' ? '新增成功' : '更新成功')
    dialogVisible.value = false
    // 重新加載用戶列表
  } catch (error) {
    console.error('表單驗證失敗:', error)
  } finally {
    submitting.value = false
  }
}

// 處理搜索
const handleSearch = () => {
  currentPage.value = 1 // 重置頁碼
}

// 處理分頁
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

onMounted(() => {
  // TODO: 獲取初始數據
  total.value = userList.value.length
})
</script>

<style scoped>
.user-list-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-content h2 {
  margin: 0;
  font-size: 24px;
}

.search-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    gap: 8px;
  }

  .search-input {
    width: 100%;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .header-content h2 {
    text-align: center;
  }
}
</style>
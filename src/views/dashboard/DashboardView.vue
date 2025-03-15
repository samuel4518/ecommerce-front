<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <!-- 歡迎卡片 -->
      <el-col :span="24" class="mb-4">
        <el-card class="welcome-card">
          <template #header>
            <div class="welcome-header">
              <h2>歡迎回來，{{ userStore.user?.name || '使用者' }}</h2>
              <el-button type="primary" @click="refreshData">刷新數據</el-button>
            </div>
          </template>
          <div class="last-login">
            上次登入時間：{{ formatDate(userStore.user?.last_login) }}
          </div>
        </el-card>
      </el-col>

      <!-- 數據概覽 -->
      <el-col :xs="24" :sm="12" :md="6" v-for="stat in statistics" :key="stat.title" class="mb-4">
        <el-card class="stat-card" :class="stat.type">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="24">
                <component :is="stat.icon" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">{{ stat.title }}</div>
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-change" :class="stat.trend">
                <el-icon>
                  <component :is="stat.trend === 'up' ? 'ArrowUp' : 'ArrowDown'" />
                </el-icon>
                {{ stat.change }}% 相較上月
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 最近活動 -->
      <el-col :xs="24" :md="12" class="mb-4">
        <el-card class="recent-activities">
          <template #header>
            <div class="card-header">
              <h3>最近活動</h3>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="activity in recentActivities"
              :key="activity.id"
              :type="activity.type"
              :timestamp="formatDate(activity.timestamp)"
            >
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>

      <!-- 待處理事項 -->
      <el-col :xs="24" :md="12" class="mb-4">
        <el-card class="todo-list">
          <template #header>
            <div class="card-header">
              <h3>待處理事項</h3>
            </div>
          </template>
          <el-table :data="todoList" style="width: 100%">
            <el-table-column prop="title" label="項目" />
            <el-table-column prop="priority" label="優先級" width="100">
              <template #default="scope">
                <el-tag :type="getPriorityType(scope.row.priority)">
                  {{ scope.row.priority }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="deadline" label="期限" width="120">
              <template #default="scope">
                {{ formatDate(scope.row.deadline) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  User,
  Goods,
  Document,
  Money,
  Plus,
  List,
  Setting,
  ArrowUp,
  ArrowDown
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 統計數據
const statistics = ref([
  {
    title: '總用戶數',
    value: '1,234',
    change: '12.5',
    trend: 'up',
    type: 'primary',
    icon: 'User'
  },
  {
    title: '產品總數',
    value: '856',
    change: '8.2',
    trend: 'up',
    type: 'success',
    icon: 'Goods'
  },
  {
    title: '本月訂單',
    value: '268',
    change: '3.1',
    trend: 'down',
    type: 'warning',
    icon: 'Document'
  },
  {
    title: '營業額',
    value: '¥89,635',
    change: '15.4',
    trend: 'up',
    type: 'danger',
    icon: 'Money'
  }
])

// 快速操作
const quickActions = ref([])  // 清空快速操作

// 最近活動
const recentActivities = ref([
  {
    id: 1,
    content: '新增產品「iPhone 14 Pro」',
    timestamp: '2024-01-20 14:30:00',
    type: 'primary'
  },
  {
    id: 2,
    content: '更新訂單 #12345 狀態為「已發貨」',
    timestamp: '2024-01-20 13:25:00',
    type: 'success'
  },
  {
    id: 3,
    content: '新用戶註冊：張小明',
    timestamp: '2024-01-20 11:20:00',
    type: 'info'
  },
  {
    id: 4,
    content: '系統更新完成',
    timestamp: '2024-01-20 10:15:00',
    type: 'warning'
  }
])

// 待處理事項
const todoList = ref([
  {
    title: '確認待發貨訂單',
    priority: '高',
    deadline: '2024-01-21'
  },
  {
    title: '更新產品庫存',
    priority: '中',
    deadline: '2024-01-22'
  },
  {
    title: '處理退貨申請',
    priority: '高',
    deadline: '2024-01-21'
  },
  {
    title: '準備月度報表',
    priority: '低',
    deadline: '2024-01-25'
  }
])

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

// 獲取優先級標籤類型
const getPriorityType = (priority) => {
  const types = {
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  }
  return types[priority] || 'info'
}

// 刷新數據
const refreshData = () => {
  // TODO: 實現刷新數據的邏輯
}

// 處理快速操作
const handleQuickAction = (route) => {
  router.push(route)
}

onMounted(() => {
  // TODO: 獲取初始數據
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.welcome-card {
  margin-bottom: 20px;
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-header h2 {
  margin: 0;
}

.last-login {
  color: #909399;
  font-size: 14px;
}

.stat-card {
  height: 120px;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  padding: 0 20px;
}

.stat-info {
  flex-grow: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin: 8px 0;
}

.stat-change {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-change.up {
  color: #67c23a;
}

.stat-change.down {
  color: #f56c6c;
}

.quick-actions .action-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.quick-actions .action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.action-card .el-icon {
  margin-bottom: 10px;
  color: var(--el-color-primary);
}

.action-title {
  font-size: 14px;
  color: #606266;
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

.mb-4 {
  margin-bottom: 16px;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px;
  }

  .stat-card {
    margin-bottom: 10px;
  }

  .welcome-header {
    flex-direction: column;
    gap: 10px;
  }

  .welcome-header h2 {
    font-size: 20px;
  }
}
</style> 
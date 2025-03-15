<template>
  <div class="order-list-container">
    <!-- 頁面標題和搜索區 -->
    <div class="page-header">
      <div class="header-content">
        <h2>訂單管理</h2>
      </div>
      
      <!-- 搜索和篩選 -->
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索訂單編號或客戶名稱"
          class="search-input"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select v-model="statusFilter" placeholder="訂單狀態" clearable @change="handleSearch">
          <el-option label="待付款" value="pending" />
          <el-option label="已付款" value="paid" />
          <el-option label="處理中" value="processing" />
          <el-option label="已出貨" value="shipped" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>

        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="開始日期"
          end-placeholder="結束日期"
          @change="handleSearch"
        />
      </div>
    </div>

    <!-- 訂單列表 -->
    <el-table
      v-loading="loading"
      :data="orderList"
      style="width: 100%"
      row-key="id"
    >
      <el-table-column prop="orderNumber" label="訂單編號" width="150" />
      <el-table-column prop="customerName" label="客戶名稱" width="120" />
      <el-table-column prop="totalAmount" label="總金額" width="120">
        <template #default="scope">
          NT$ {{ formatPrice(scope.row.totalAmount) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="狀態" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="建立時間" width="160">
        <template #default="scope">
          {{ formatDate(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column prop="updatedAt" label="更新時間" width="160">
        <template #default="scope">
          {{ formatDate(scope.row.updatedAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button-group>
            <el-button
              type="primary"
              :icon="View"
              @click="handleViewDetails(scope.row)"
              title="查看詳情"
            />
            <el-button
              type="success"
              :icon="Edit"
              @click="handleUpdateStatus(scope.row)"
              title="更新狀態"
              :disabled="scope.row.status === 'cancelled'"
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

    <!-- 訂單詳情對話框 -->
    <el-dialog
      v-model="detailsVisible"
      title="訂單詳情"
      width="800px"
    >
      <template v-if="currentOrder">
        <div class="order-details">
          <div class="detail-section">
            <h3>基本信息</h3>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="訂單編號">{{ currentOrder.orderNumber }}</el-descriptions-item>
              <el-descriptions-item label="訂單狀態">
                <el-tag :type="getStatusType(currentOrder.status)">
                  {{ getStatusLabel(currentOrder.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="客戶名稱">{{ currentOrder.customerName }}</el-descriptions-item>
              <el-descriptions-item label="聯絡電話">{{ currentOrder.phone }}</el-descriptions-item>
              <el-descriptions-item label="送貨地址" :span="2">{{ currentOrder.address }}</el-descriptions-item>
              <el-descriptions-item label="建立時間">{{ formatDate(currentOrder.createdAt) }}</el-descriptions-item>
              <el-descriptions-item label="更新時間">{{ formatDate(currentOrder.updatedAt) }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="detail-section">
            <h3>商品清單</h3>
            <el-table :data="currentOrder.items" style="width: 100%">
              <el-table-column prop="productName" label="商品名稱" />
              <el-table-column prop="quantity" label="數量" width="100" />
              <el-table-column prop="price" label="單價" width="120">
                <template #default="scope">
                  NT$ {{ formatPrice(scope.row.price) }}
                </template>
              </el-table-column>
              <el-table-column label="小計" width="120">
                <template #default="scope">
                  NT$ {{ formatPrice(scope.row.price * scope.row.quantity) }}
                </template>
              </el-table-column>
            </el-table>
            <div class="order-summary">
              <p>商品總額：NT$ {{ formatPrice(currentOrder.subtotal) }}</p>
              <p>運費：NT$ {{ formatPrice(currentOrder.shippingFee) }}</p>
              <p class="total">訂單總額：NT$ {{ formatPrice(currentOrder.totalAmount) }}</p>
            </div>
          </div>

          <div class="detail-section" v-if="currentOrder.note">
            <h3>備註</h3>
            <p>{{ currentOrder.note }}</p>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 更新狀態對話框 -->
    <el-dialog
      v-model="statusDialogVisible"
      title="更新訂單狀態"
      width="400px"
    >
      <el-form :model="statusForm" label-width="100px">
        <el-form-item label="訂單狀態">
          <el-select v-model="statusForm.status" style="width: 100%">
            <el-option label="待付款" value="pending" />
            <el-option label="已付款" value="paid" />
            <el-option label="處理中" value="processing" />
            <el-option label="已出貨" value="shipped" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="備註">
          <el-input
            v-model="statusForm.note"
            type="textarea"
            :rows="3"
            placeholder="請輸入狀態更新備註"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitStatusUpdate" :loading="submitting">
          確認
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  View,
  Edit
} from '@element-plus/icons-vue'

// 狀態
const loading = ref(false)
const submitting = ref(false)
const detailsVisible = ref(false)
const statusDialogVisible = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const dateRange = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const currentOrder = ref(null)

// 狀態更新表單
const statusForm = reactive({
  status: '',
  note: ''
})

// 模擬的訂單數據
const mockOrders = [
  {
    id: 1,
    orderNumber: 'ORD20240120001',
    customerName: '張小明',
    phone: '0912345678',
    address: '台北市信義區信義路五段7號',
    totalAmount: 41900,
    subtotal: 41400,
    shippingFee: 500,
    status: 'processing',
    createdAt: '2024-01-20 10:30:00',
    updatedAt: '2024-01-20 14:20:00',
    note: '請於週間下午配送',
    items: [
      {
        productName: 'iPhone 15 Pro',
        quantity: 1,
        price: 38900
      },
      {
        productName: '手機保護殼',
        quantity: 1,
        price: 2500
      }
    ]
  },
  {
    id: 2,
    orderNumber: 'ORD20240120002',
    customerName: '李小華',
    phone: '0923456789',
    address: '台北市大安區敦化南路二段201號',
    totalAmount: 3000,
    subtotal: 2800,
    shippingFee: 200,
    status: 'paid',
    createdAt: '2024-01-20 11:15:00',
    updatedAt: '2024-01-20 11:15:00',
    items: [
      {
        productName: '電動咖啡磨豆機',
        quantity: 1,
        price: 2500
      },
      {
        productName: '咖啡豆',
        quantity: 1,
        price: 300
      }
    ]
  }
]

// 過濾後的訂單列表
const orderList = computed(() => {
  let filteredOrders = [...mockOrders]

  // 搜索條件過濾
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filteredOrders = filteredOrders.filter(order => 
      order.orderNumber.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query)
    )
  }

  // 狀態過濾
  if (statusFilter.value) {
    filteredOrders = filteredOrders.filter(order => order.status === statusFilter.value)
  }

  // 日期範圍過濾
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    const startDate = new Date(dateRange.value[0])
    const endDate = new Date(dateRange.value[1])
    filteredOrders = filteredOrders.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= startDate && orderDate <= endDate
    })
  }

  // 更新總數
  total.value = filteredOrders.length

  // 分頁處理
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredOrders.slice(start, end)
})

// 格式化價格
const formatPrice = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
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

// 獲取狀態標籤類型
const getStatusType = (status) => {
  const types = {
    'pending': 'warning',
    'paid': 'success',
    'processing': 'primary',
    'shipped': 'success',
    'completed': '',
    'cancelled': 'info'
  }
  return types[status] || ''
}

// 獲取狀態標籤文字
const getStatusLabel = (status) => {
  const labels = {
    'pending': '待付款',
    'paid': '已付款',
    'processing': '處理中',
    'shipped': '已出貨',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return labels[status] || status
}

// 查看訂單詳情
const handleViewDetails = (order) => {
  currentOrder.value = order
  detailsVisible.value = true
}

// 更新訂單狀態
const handleUpdateStatus = (order) => {
  statusForm.status = order.status
  statusForm.note = ''
  currentOrder.value = order
  statusDialogVisible.value = true
}

// 提交狀態更新
const submitStatusUpdate = async () => {
  if (!statusForm.status) {
    ElMessage.warning('請選擇訂單狀態')
    return
  }

  try {
    submitting.value = true
    // TODO: 調用 API 更新訂單狀態
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新本地數據
    if (currentOrder.value) {
      currentOrder.value.status = statusForm.status
      currentOrder.value.updatedAt = new Date().toISOString()
    }
    
    ElMessage.success('狀態更新成功')
    statusDialogVisible.value = false
  } catch (error) {
    console.error('更新失敗:', error)
    ElMessage.error('更新失敗，請稍後再試')
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
  total.value = orderList.value.length
})
</script>

<style scoped>
.order-list-container {
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

.detail-section {
  margin-bottom: 24px;
}

.detail-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 500;
}

.order-summary {
  margin-top: 16px;
  text-align: right;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.order-summary p {
  margin: 8px 0;
}

.order-summary .total {
  font-size: 16px;
  font-weight: bold;
  color: #409EFF;
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
<template>
  <div class="product-list-container">
    <!-- 頁面標題和操作按鈕 -->
    <div class="page-header">
      <div class="header-content">
        <h2>產品管理</h2>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增產品
        </el-button>
      </div>
      
      <!-- 搜索和篩選 -->
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索產品名稱或編號"
          class="search-input"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select v-model="categoryFilter" placeholder="分類篩選" clearable @change="handleSearch">
          <el-option label="3C產品" value="3c" />
          <el-option label="家電" value="appliance" />
          <el-option label="生活用品" value="life" />
          <el-option label="食品" value="food" />
        </el-select>
        
        <el-select v-model="statusFilter" placeholder="狀態篩選" clearable @change="handleSearch">
          <el-option label="上架中" value="active" />
          <el-option label="已下架" value="inactive" />
        </el-select>
      </div>
    </div>

    <!-- 產品列表 -->
    <el-table
      v-loading="loading"
      :data="productList"
      style="width: 100%"
      row-key="id"
    >
      <el-table-column prop="code" label="產品編號" width="120" />
      <el-table-column prop="name" label="產品名稱" min-width="200">
        <template #default="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="category" label="分類" width="100">
        <template #default="scope">
          <el-tag>{{ getCategoryLabel(scope.row.category) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="價格" width="120">
        <template #default="scope">
          NT$ {{ formatPrice(scope.row.price) }}
        </template>
      </el-table-column>
      <el-table-column prop="stock" label="庫存" width="100" />
      <el-table-column prop="status" label="狀態" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
            {{ scope.row.status === 'active' ? '上架中' : '已下架' }}
          </el-tag>
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
              :title="scope.row.status === 'active' ? '下架' : '上架'"
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

    <!-- 產品表單對話框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增產品' : '編輯產品'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="productForm"
        :rules="rules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="產品編號" prop="code">
          <el-input v-model="productForm.code" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="產品名稱" prop="name">
          <el-input v-model="productForm.name" />
        </el-form-item>
        <el-form-item label="分類" prop="category">
          <el-select v-model="productForm.category" style="width: 100%">
            <el-option label="3C產品" value="3c" />
            <el-option label="家電" value="appliance" />
            <el-option label="生活用品" value="life" />
            <el-option label="食品" value="food" />
          </el-select>
        </el-form-item>
        <el-form-item label="價格" prop="price">
          <el-input-number 
            v-model="productForm.price"
            :min="0"
            :precision="0"
            :step="100"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="庫存" prop="stock">
          <el-input-number 
            v-model="productForm.stock"
            :min="0"
            :precision="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="productForm.description"
            type="textarea"
            :rows="4"
            placeholder="請輸入產品描述"
          />
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
const categoryFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 表單相關
const formRef = ref(null)
const productForm = reactive({
  code: '',
  name: '',
  category: '',
  price: 0,
  stock: 0,
  description: ''
})

// 表單驗證規則
const rules = {
  code: [
    { required: true, message: '請輸入產品編號', trigger: 'blur' },
    { min: 3, message: '編號長度至少為 3 個字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '請輸入產品名稱', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '請選擇產品分類', trigger: 'change' }
  ],
  price: [
    { required: true, message: '請輸入產品價格', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '請輸入產品庫存', trigger: 'blur' }
  ]
}

// 模擬的產品數據
const mockProducts = [
  {
    id: 1,
    code: 'P001',
    name: 'iPhone 15 Pro',
    category: '3c',
    price: 38900,
    stock: 50,
    status: 'active',
    description: '最新款 iPhone，搭載 A17 Pro 晶片'
  },
  {
    id: 2,
    code: 'P002',
    name: '電動咖啡磨豆機',
    category: 'appliance',
    price: 2500,
    stock: 30,
    status: 'active',
    description: '專業級咖啡磨豆機，多段粗細調節'
  },
  {
    id: 3,
    code: 'P003',
    name: '環保不鏽鋼吸管組',
    category: 'life',
    price: 299,
    stock: 200,
    status: 'active',
    description: '可重複使用的環保吸管，附清潔刷'
  },
  {
    id: 4,
    code: 'P004',
    name: '有機綠茶包',
    category: 'food',
    price: 350,
    stock: 80,
    status: 'inactive',
    description: '日本進口有機綠茶，20包入'
  }
]

// 過濾後的產品列表
const productList = computed(() => {
  let filteredProducts = [...mockProducts]

  // 搜索條件過濾
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filteredProducts = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.code.toLowerCase().includes(query)
    )
  }

  // 分類過濾
  if (categoryFilter.value) {
    filteredProducts = filteredProducts.filter(product => product.category === categoryFilter.value)
  }

  // 狀態過濾
  if (statusFilter.value) {
    filteredProducts = filteredProducts.filter(product => product.status === statusFilter.value)
  }

  // 更新總數
  total.value = filteredProducts.length

  // 分頁處理
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredProducts.slice(start, end)
})

// 格式化價格
const formatPrice = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 獲取分類標籤
const getCategoryLabel = (category) => {
  const categories = {
    '3c': '3C產品',
    'appliance': '家電',
    'life': '生活用品',
    'food': '食品'
  }
  return categories[category] || category
}

// 處理新增產品
const handleAdd = () => {
  dialogType.value = 'add'
  Object.assign(productForm, {
    code: '',
    name: '',
    category: '',
    price: 0,
    stock: 0,
    description: ''
  })
  dialogVisible.value = true
}

// 處理編輯產品
const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(productForm, { ...row })
  dialogVisible.value = true
}

// 處理切換產品狀態
const handleToggleStatus = async (row) => {
  try {
    await ElMessageBox.confirm(
      `確定要${row.status === 'active' ? '下架' : '上架'}該產品嗎？`,
      '提示',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // TODO: 調用 API 更新產品狀態
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
    
    // TODO: 調用 API 保存產品數據
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success(dialogType.value === 'add' ? '新增成功' : '更新成功')
    dialogVisible.value = false
    // 重新加載產品列表
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
  total.value = productList.value.length
})
</script>

<style scoped>
.product-list-container {
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
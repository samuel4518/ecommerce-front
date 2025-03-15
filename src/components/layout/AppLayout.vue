<template>
  <div class="app-container">
    <el-container class="layout-container">
      <!-- 側邊欄 -->
      <el-aside :width="isCollapse ? '64px' : '200px'" class="aside">
        <div class="logo-container">
          <img src="@/assets/logo.svg" alt="Logo" class="logo" v-if="!isCollapse" />
          <img src="@/assets/logo-small.svg" alt="Logo" class="logo-small" v-else />
        </div>
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          :collapse="isCollapse"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#ffffff"
          :collapse-transition="true"
          @select="handleSelect"
        >
          <el-menu-item index="/dashboard">
            <el-icon><Monitor /></el-icon>
            <template #title>主控台</template>
          </el-menu-item>

          <el-menu-item index="/products">
            <el-icon><Goods /></el-icon>
            <template #title>產品管理</template>
          </el-menu-item>

          <el-menu-item index="/orders">
            <el-icon><List /></el-icon>
            <template #title>訂單管理</template>
          </el-menu-item>

          <el-menu-item index="/users" v-if="userStore.isAdmin">
            <el-icon><User /></el-icon>
            <template #title>用戶管理</template>
          </el-menu-item>

          <el-menu-item index="/settings" v-if="userStore.isAdmin">
            <el-icon><Setting /></el-icon>
            <template #title>系統設定</template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <!-- 頂部導航 -->
        <el-header class="header">
          <div class="header-left">
            <el-button type="text" @click="toggleCollapse">
              <el-icon :size="20">
                <component :is="isCollapse ? Expand : Fold" />
              </el-icon>
            </el-button>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/dashboard' }">首頁</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>

          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="user-dropdown">
                <el-avatar :size="32" :icon="UserFilled" />
                <span class="username">{{ userStore.user?.name }}</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">個人資料</el-dropdown-item>
                  <el-dropdown-item command="changePassword">修改密碼</el-dropdown-item>
                  <el-dropdown-item divided command="logout">登出</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 主要內容區 -->
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  Monitor,
  User,
  Goods,
  List,
  Fold,
  Expand,
  UserFilled,
  Setting
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isCollapse = ref(false)

// 當前激活的菜單項
const activeMenu = computed(() => route.path)

// 當前頁面標題
const currentPageTitle = computed(() => {
  const routeTitles = {
    '/dashboard': '主控台',    
    '/products': '產品管理',
    '/orders': '訂單管理',
    '/users': '用戶管理',
    '/settings': '系統設定'
  }
  return routeTitles[route.path] || ''
})

// 切換側邊欄收合狀態
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 處理菜單選擇
const handleSelect = (index) => {
  router.push(index)
}

// 處理用戶下拉選單命令
const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'changePassword':
      router.push('/change-password')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('確定要登出嗎？', '提示', {
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        userStore.clearAuth()
        router.push('/login')
        ElMessage.success('已成功登出')
      } catch (error) {
        // 用戶取消登出
      }
      break
  }
}
</script>

<style scoped>
.app-container {
  height: 100vh;
}

.layout-container {
  height: 100%;
}

.aside {
  background-color: #304156;
  transition: width 0.3s;
  overflow-x: hidden;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b2f3a;
  overflow: hidden;
}

.logo {
  height: 32px;
  object-fit: contain;
  transition: all 0.3s;
}

.logo-small {
  height: 32px;
  width: 32px;
  object-fit: contain;
  transition: all 0.3s;
}

.el-menu-vertical {
  border-right: none;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 200px;
}

/* 自定義選單樣式 */
:deep(.el-menu-item) {
  &:hover {
    background-color: #263445 !important;
  }

  &.is-active {
    background-color: #1f2d3d !important;
    border-right: 2px solid #409EFF;
  }
}

:deep(.el-menu-item .el-icon) {
  color: #bfcbd9;
}

:deep(.el-menu-item.is-active .el-icon) {
  color: #409EFF;
}

:deep(.el-menu-item.is-active) {
  color: #ffffff !important;
}

:deep(.el-menu-item:hover .el-icon) {
  color: #ffffff;
}

:deep(.el-menu-item:hover) {
  color: #ffffff !important;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: 8px;
  font-size: 14px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .aside {
    position: fixed;
    height: 100%;
    z-index: 1000;
  }

  .header {
    padding: 0 10px;
  }

  .username {
    display: none;
  }
}
</style> 
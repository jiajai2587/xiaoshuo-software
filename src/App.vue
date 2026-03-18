<template>
  <el-container class="app-container">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <el-icon :size="32"><Document /></el-icon>
        <span>小说创作大师</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        class="sidebar-menu"
        background-color="#1f2937"
        text-color="#9ca3af"
        active-text-color="#3b82f6"
      >
        <el-menu-item index="/project">
          <el-icon><FolderOpened /></el-icon>
          <span>项目管理</span>
        </el-menu-item>
        <el-menu-item index="/outline">
          <el-icon><List /></el-icon>
          <span>章节大纲</span>
        </el-menu-item>
        <el-menu-item index="/generate">
          <el-icon><Edit /></el-icon>
          <span>小说生成</span>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <span>设定管理</span>
        </el-menu-item>
        <el-menu-item index="/progress">
          <el-icon><DataLine /></el-icon>
          <span>生成进度</span>
        </el-menu-item>
        <el-menu-item index="/browser">
          <el-icon><Monitor /></el-icon>
          <span>捕获进度</span>
        </el-menu-item>
        <el-menu-item index="/api">
          <el-icon><Key /></el-icon>
          <span>API接口</span>
        </el-menu-item>
        <el-menu-item index="/contact">
          <el-icon><Phone /></el-icon>
          <span>联系我们</span>
        </el-menu-item>
      </el-menu>
      <div class="current-project" v-if="currentProject">
        <div class="project-name">{{ currentProject.name }}</div>
        <div class="project-info">{{ currentProject.chapters?.length || 0 }} 章</div>
      </div>
    </el-aside>
    <el-container class="main-container">
      <el-header class="header">
        <div class="header-left">
          <h2>{{ pageTitle }}</h2>
        </div>
        <div class="header-right">
          <div class="activation-status" v-if="cardStore.isActivated">
            <el-tag type="success">
              <el-icon><CircleCheck /></el-icon>
              剩余 {{ cardStore.remainingDays }} 天
            </el-tag>
            <el-button type="danger" size="small" @click="handleLogout">退出</el-button>
          </div>
          <el-button v-if="currentProject" @click="exportProject" type="primary">
            <el-icon><Download /></el-icon>
            导出项目
          </el-button>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/projectStore'
import { useCardStore } from '@/stores/cardStore'
import { ElMessage } from 'element-plus'
import { Download, CircleCheck } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const cardStore = useCardStore()

const activeMenu = computed(() => route.path)
const currentProject = computed(() => projectStore.currentProject)

const pageTitle = computed(() => {
  const titles = {
    '/project': '项目管理',
    '/outline': '章节大纲生成',
    '/generate': '小说内容生成',
    '/settings': '角色与世界设定',
    '/progress': '生成进度监控',
    '/browser': 'DeepSeek 浏览器',
    '/api': 'API 接口配置',
    '/contact': '联系我们'
  }
  return titles[route.path] || '小说创作大师'
})

const exportProject = () => {
  if (!projectStore.currentProject) {
    ElMessage.warning('请先选择一个项目')
    return
  }
  ElMessage.success('导出功能开发中')
}

const handleLogout = () => {
  cardStore.logout()
  router.push('/card-verify')
}

onMounted(() => {
  projectStore.loadProjects()
  cardStore.loadActivation()
})
</script>

<style scoped>
.app-container {
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  background-color: #1f2937;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #374151;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 20px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #374151;
}

.sidebar-menu {
  flex: 1;
  border: none;
}

.current-project {
  padding: 16px 20px;
  border-top: 1px solid #374151;
  color: #9ca3af;
}

.project-name {
  font-size: 14px;
  color: white;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-info {
  font-size: 12px;
  margin-top: 4px;
}

.main-container {
  display: flex;
  flex-direction: column;
  background-color: #f9fafb;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 24px;
  height: 64px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  color: #111827;
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.activation-status {
  display: flex;
  gap: 12px;
  align-items: center;
}

.main-content {
  overflow: auto;
  padding: 24px;
}
</style>

<template>
  <div class="browser-view">
    <el-card class="browser-card">
      <template #header>
        <div class="header-content">
          <div class="browser-controls">
            <el-button size="small" @click="goBack" :disabled="!canGoBack">
              <el-icon><ArrowLeft /></el-icon>
            </el-button>
            <el-button size="small" @click="goForward" :disabled="!canGoForward">
              <el-icon><ArrowRight /></el-icon>
            </el-button>
            <el-button size="small" @click="refresh">
              <el-icon><Refresh /></el-icon>
            </el-button>
            <el-input 
              v-model="currentUrl" 
              size="small"
              style="width: 400px; margin-left: 12px;"
              @keyup.enter="navigate"
            />
            <el-button size="small" type="primary" @click="navigate" style="margin-left: 8px;">
              访问
            </el-button>
          </div>
          <div class="header-actions">
            <el-tag :type="capturing ? 'success' : 'info'">
              {{ capturing ? '捕获中' : '已就绪' }}
            </el-tag>
            <el-button 
              size="small" 
              :type="capturing ? 'danger' : 'primary'"
              @click="toggleCapture"
            >
              <el-icon v-if="capturing"><VideoPause /></el-icon>
              <el-icon v-else><VideoCamera /></el-icon>
              {{ capturing ? '停止捕获' : '开始捕获' }}
            </el-button>
          </div>
        </div>
      </template>

      <div class="browser-container">
        <div v-if="showMask" class="browser-mask">
          <div class="mask-content">
            <el-icon :size="64"><Lock /></el-icon>
            <p>自动化生成进行中，请勿操作</p>
            <el-progress :percentage="maskProgress" :stroke-width="20" style="width: 300px;" />
          </div>
        </div>
        <div class="browser-placeholder">
          <el-empty description="DeepSeek 浏览器">
            <el-button type="primary" @click="openDeepSeek">
              打开 DeepSeek
            </el-button>
          </el-empty>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>使用说明</span>
          </template>
          <div class="guide-steps">
            <div class="step-item">
              <div class="step-num">1</div>
              <div class="step-content">
                <h4>登录 DeepSeek</h4>
                <p>点击上方按钮打开 DeepSeek 网站，使用微信扫码或账号登录</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-num">2</div>
              <div class="step-content">
                <h4>复制提示词</h4>
                <p>在「小说生成」页面复制生成的提示词</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-num">3</div>
              <div class="step-content">
                <h4>发送给 AI</h4>
                <p>将提示词粘贴到 DeepSeek 对话框并发送</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-num">4</div>
              <div class="step-content">
                <h4>复制结果</h4>
                <p>将 AI 返回的内容复制回「小说生成」页面</p>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>捕获记录</span>
              <el-button size="small" @click="clearRecords">清空</el-button>
            </div>
          </template>
          <div class="records-container">
            <el-empty v-if="records.length === 0" description="暂无捕获记录" />
            <div v-else class="records-list">
              <div v-for="(record, i) in records" :key="i" class="record-item">
                <div class="record-time">{{ record.time }}</div>
                <div class="record-content">{{ record.content }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null }

const currentUrl = ref('https://chat.deepseek.com')
const canGoBack = ref(false)
const canGoForward = ref(false)
const capturing = ref(false)
const showMask = ref(false)
const maskProgress = ref(0)
const records = ref([])

const openDeepSeek = () => {
  if (ipcRenderer) {
    ipcRenderer.invoke('open-browser')
    ElMessage.success('已打开 DeepSeek 浏览器')
  } else {
    window.open('https://chat.deepseek.com', '_blank')
    ElMessage.success('已在新标签页打开')
  }
  addRecord('打开 DeepSeek 网站')
}

const navigate = () => {
  if (!currentUrl.value) {
    ElMessage.warning('请输入网址')
    return
  }
  addRecord(`导航到: ${currentUrl.value}`)
  ElMessage.info('导航功能开发中')
}

const goBack = () => {
  addRecord('后退')
}

const goForward = () => {
  addRecord('前进')
}

const refresh = () => {
  addRecord('刷新页面')
}

const toggleCapture = () => {
  capturing.value = !capturing.value
  if (capturing.value) {
    addRecord('开始捕获...')
    simulateCapture()
  } else {
    addRecord('停止捕获')
    showMask.value = false
  }
  ElMessage.success(capturing.value ? '已开始捕获' : '已停止捕获')
}

const simulateCapture = () => {
  showMask.value = true
  maskProgress.value = 0
  const interval = setInterval(() => {
    maskProgress.value += 5
    if (maskProgress.value >= 100) {
      clearInterval(interval)
      setTimeout(() => {
        showMask.value = false
        capturing.value = false
        addRecord('捕获完成')
        ElMessage.success('捕获完成！')
      }, 500)
    }
  }, 200)
}

const addRecord = (content) => {
  records.value.unshift({
    time: new Date().toLocaleTimeString('zh-CN'),
    content
  })
  if (records.value.length > 50) {
    records.value = records.value.slice(0, 50)
  }
}

const clearRecords = () => {
  records.value = []
  ElMessage.success('记录已清空')
}

onMounted(() => {
  addRecord('浏览器视图已就绪')
})
</script>

<style scoped>
.browser-view {
  height: 100%;
}

.browser-card {
  height: calc(100vh - 280px);
  display: flex;
  flex-direction: column;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.browser-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.browser-container {
  flex: 1;
  position: relative;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f4f6;
}

.browser-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.browser-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.mask-content {
  text-align: center;
  color: white;
}

.mask-content .el-icon {
  margin-bottom: 16px;
}

.mask-content p {
  margin-bottom: 24px;
  font-size: 16px;
}

.guide-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-item {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.step-num {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #111827;
}

.step-content p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.records-container {
  max-height: 300px;
  overflow-y: auto;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.record-item {
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 6px;
  border-left: 3px solid #3b82f6;
}

.record-time {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.record-content {
  font-size: 14px;
  color: #374151;
}
</style>

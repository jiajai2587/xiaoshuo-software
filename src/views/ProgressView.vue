<template>
  <div class="progress-view">
    <el-alert v-if="!currentProject" type="warning" show-icon style="margin-bottom: 20px;">
      请先在「项目管理」中选择或创建一个项目
    </el-alert>

    <div v-else>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card>
            <template #header>
              <span>项目统计</span>
            </template>
            <el-statistic title="总章节数" :value="projectChapters.length" />
            <el-divider />
            <el-statistic title="已完成" :value="completedChapters" />
            <el-divider />
            <el-statistic title="总字数" :value="totalWords" />
            <el-divider />
            <el-statistic title="平均章节" :value="avgWords" suffix="字" />
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card>
            <template #header>
              <span>生成进度</span>
            </template>
            <el-progress 
              :percentage="progressPercent" 
              :color="progressColor"
              :stroke-width="20"
            />
            <div style="margin-top: 20px;">
              <p style="color: #6b7280; margin-bottom: 8px;">生成状态</p>
              <el-tag :type="isGenerating ? 'warning' : 'success'">
                {{ isGenerating ? '正在生成...' : '空闲' }}
              </el-tag>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card>
            <template #header>
              <span>章节分布</span>
            </template>
            <div class="status-stats">
              <div class="status-item">
                <span class="dot" style="background: #6b7280;"></span>
                <span>大纲完成</span>
                <span class="count">{{ statusCount.outline }}</span>
              </div>
              <div class="status-item">
                <span class="dot" style="background: #f59e0b;"></span>
                <span>生成中</span>
                <span class="count">{{ statusCount.generating }}</span>
              </div>
              <div class="status-item">
                <span class="dot" style="background: #10b981;"></span>
                <span>已完成</span>
                <span class="count">{{ statusCount.done }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>操作日志</span>
                <el-button size="small" @click="clearLogs">清空日志</el-button>
              </div>
            </template>
            <div class="logs-container">
              <el-empty v-if="!logs?.length" description="暂无日志" />
              <div v-else class="logs-list">
                <div 
                  v-for="log in logs" 
                  :key="log.id"
                  class="log-item"
                  :class="log.type"
                >
                  <div class="log-icon">
                    <el-icon v-if="log.type === 'success'"><CircleCheck /></el-icon>
                    <el-icon v-else-if="log.type === 'error'"><CircleClose /></el-icon>
                    <el-icon v-else-if="log.type === 'warning'"><WarningFilled /></el-icon>
                    <el-icon v-else><InfoFilled /></el-icon>
                  </div>
                  <div class="log-content">
                    <div class="log-message">{{ log.message }}</div>
                    <div class="log-time">{{ formatTime(log.timestamp) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card>
            <template #header>
              <span>章节详情</span>
            </template>
            <el-table :data="projectChapters" style="width: 100%">
              <el-table-column prop="number" label="章节" width="80" />
              <el-table-column prop="title" label="标题" min-width="200" />
              <el-table-column prop="wordCount" label="字数" width="100" />
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)" size="small">
                    {{ getStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="创建时间" width="180">
                <template #default="{ row }">
                  {{ formatDate(row.createdAt) }}
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { ElMessage, ElMessageBox } from 'element-plus'

const projectStore = useProjectStore()
const currentProject = computed(() => projectStore.currentProject)
const projectChapters = computed(() => currentProject.value?.chapters || [])
const logs = computed(() => currentProject.value?.logs || [])

const completedChapters = computed(() => projectChapters.value.filter(c => c.status === 'done').length)
const totalWords = computed(() => projectChapters.value.reduce((sum, c) => sum + (c.wordCount || 0), 0))
const avgWords = computed(() => {
  const done = projectChapters.value.filter(c => c.wordCount > 0)
  return done.length > 0 ? Math.round(totalWords.value / done.length) : 0
})
const progressPercent = computed(() => {
  if (projectChapters.value.length === 0) return 0
  return Math.round((completedChapters.value / projectChapters.value.length) * 100)
})
const progressColor = computed(() => {
  if (progressPercent.value < 30) return '#f59e0b'
  if (progressPercent.value < 70) return '#3b82f6'
  return '#10b981'
})
const isGenerating = computed(() => projectChapters.value.some(c => c.status === 'generating'))
const statusCount = computed(() => {
  const count = { outline: 0, generating: 0, done: 0 }
  projectChapters.value.forEach(c => {
    count[c.status] = (count[c.status] || 0) + 1
  })
  return count
})

const getStatusType = (status) => {
  const types = { outline: 'info', generating: 'warning', done: 'success' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { outline: '大纲完成', generating: '生成中', done: '已完成' }
  return texts[status] || '未知'
}

const formatTime = (timeStr) => {
  return new Date(timeStr).toLocaleString('zh-CN')
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

const clearLogs = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有日志吗？', '确认', { type: 'warning' })
    currentProject.value.logs = []
    projectStore.saveProject()
    ElMessage.success('日志已清空')
  } catch {}
}
</script>

<style scoped>
.progress-view {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-item .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-item .count {
  margin-left: auto;
  font-weight: bold;
  font-size: 18px;
}

.logs-container {
  max-height: 400px;
  overflow-y: auto;
}

.logs-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #f9fafb;
}

.log-item.success {
  background: #f0fdf4;
  border-left: 3px solid #10b981;
}

.log-item.error {
  background: #fef2f2;
  border-left: 3px solid #ef4444;
}

.log-item.warning {
  background: #fffbeb;
  border-left: 3px solid #f59e0b;
}

.log-item.info {
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
}

.log-icon {
  font-size: 20px;
  margin-top: 2px;
}

.log-item.success .log-icon { color: #10b981; }
.log-item.error .log-icon { color: #ef4444; }
.log-item.warning .log-icon { color: #f59e0b; }
.log-item.info .log-icon { color: #3b82f6; }

.log-content {
  flex: 1;
}

.log-message {
  font-size: 14px;
  color: #374151;
  margin-bottom: 4px;
}

.log-time {
  font-size: 12px;
  color: #9ca3af;
}
</style>

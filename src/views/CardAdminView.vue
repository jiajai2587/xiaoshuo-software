<template>
  <div class="card-admin-container">
    <el-container class="admin-layout">
      <el-aside width="220px" class="sidebar">
        <div class="logo">
          <el-icon :size="32"><Key /></el-icon>
          <span>卡密管理后台</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          background-color="#1f2937"
          text-color="#9ca3af"
          active-text-color="#3b82f6"
        >
          <el-menu-item index="generate" @click="activeMenu = 'generate'">
            <el-icon><Plus /></el-icon>
            <span>生成卡密</span>
          </el-menu-item>
          <el-menu-item index="list" @click="activeMenu = 'list'">
            <el-icon><List /></el-icon>
            <span>卡密列表</span>
          </el-menu-item>
          <el-menu-item index="stats" @click="activeMenu = 'stats'">
            <el-icon><DataLine /></el-icon>
            <span>数据统计</span>
          </el-menu-item>
        </el-menu>
        <div class="logout-section">
          <el-button type="danger" plain @click="goBack" style="width: 100%">
            返回前台
          </el-button>
        </div>
      </el-aside>

      <el-container class="main-container">
        <el-header class="header">
          <div class="header-left">
            <h2>{{ pageTitle }}</h2>
          </div>
        </el-header>
        <el-main class="main-content">
          <div v-if="activeMenu === 'generate'" class="generate-section">
            <el-card>
              <template #header>
                <span>生成新卡密</span>
              </template>
              <el-form :model="generateForm" label-width="120px">
                <el-form-item label="生成数量">
                  <el-input-number v-model="generateForm.count" :min="1" :max="100" />
                </el-form-item>
                <el-form-item label="有效天数">
                  <el-select v-model="generateForm.duration" style="width: 100%">
                    <el-option label="1天" :value="1" />
                    <el-option label="7天" :value="7" />
                    <el-option label="30天" :value="30" />
                  </el-select>
                </el-form-item>
                <el-form-item label="卡密类型">
                  <el-select v-model="generateForm.type" style="width: 100%">
                    <el-option label="普通版" value="normal" />
                    <el-option label="专业版" value="pro" />
                    <el-option label="尊享版" value="premium" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :loading="generating" @click="handleGenerate">
                    生成卡密
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>

            <el-card v-if="newCards.length > 0" style="margin-top: 24px">
              <template #header>
                <div class="card-header">
                  <span>新生成的卡密</span>
                  <el-button type="primary" size="small" @click="copyAllCards">
                    复制全部
                  </el-button>
                </div>
              </template>
              <div class="new-cards-list">
                <div v-for="(card, index) in newCards" :key="card.id" class="card-item">
                  <span class="card-index">{{ index + 1 }}.</span>
                  <el-tag type="success" class="card-key">{{ card.key }}</el-tag>
                  <span class="card-info">
                    {{ cardTypeText(card.type) }} - {{ card.duration }}天
                  </span>
                  <el-button
                    type="primary"
                    size="small"
                    link
                    @click="copyCard(card.key)"
                  >
                    复制
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>

          <div v-else-if="activeMenu === 'list'" class="list-section">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>卡密列表</span>
                  <div class="header-buttons">
                    <el-button type="success" size="small" @click="exportSelected" :disabled="selectedCards.length === 0">
                      导出选中
                    </el-button>
                    <el-button type="primary" size="small" @click="exportAll">
                      导出全部
                    </el-button>
                    <el-button type="warning" size="small" @click="batchDelete" :disabled="selectedCards.length === 0">
                      批量删除
                    </el-button>
                    <el-button type="primary" size="small" @click="loadCards">
                      刷新
                    </el-button>
                  </div>
                </div>
              </template>
              <el-table 
                :data="cards" 
                stripe 
                style="width: 100%"
                @selection-change="handleSelectionChange"
              >
                <el-table-column type="selection" width="55" />
                <el-table-column prop="key" label="卡密" width="180">
                  <template #default="{ row }">
                    <el-tag :type="row.used ? 'info' : 'success'">
                      {{ row.key }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="type" label="类型" width="100">
                  <template #default="{ row }">
                    {{ cardTypeText(row.type) }}
                  </template>
                </el-table-column>
                <el-table-column prop="duration" label="天数" width="80" />
                <el-table-column prop="used" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.used ? 'danger' : 'success'">
                      {{ row.used ? '已使用' : '未使用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="createdAt" label="创建时间" width="180">
                  <template #default="{ row }">
                    {{ formatDate(row.createdAt) }}
                  </template>
                </el-table-column>
                <el-table-column prop="usedAt" label="使用时间" width="180">
                  <template #default="{ row }">
                    {{ row.usedAt ? formatDate(row.usedAt) : '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="180">
                  <template #default="{ row }">
                    <el-button
                      type="primary"
                      size="small"
                      link
                      @click="copyCard(row.key)"
                    >
                      复制
                    </el-button>
                    <el-button
                      type="danger"
                      size="small"
                      link
                      @click="handleDelete(row)"
                      :disabled="row.used"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>

          <div v-else-if="activeMenu === 'stats'" class="stats-section">
            <el-row :gutter="24">
              <el-col :span="8">
                <el-card class="stat-card">
                  <div class="stat-content">
                    <div class="stat-icon total">
                      <el-icon :size="32"><Document /></el-icon>
                    </div>
                    <div class="stat-info">
                      <div class="stat-value">{{ stats.total }}</div>
                      <div class="stat-label">总卡密数</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="stat-card">
                  <div class="stat-content">
                    <div class="stat-icon unused">
                      <el-icon :size="32"><CircleCheck /></el-icon>
                    </div>
                    <div class="stat-info">
                      <div class="stat-value">{{ stats.unused }}</div>
                      <div class="stat-label">未使用</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="stat-card">
                  <div class="stat-content">
                    <div class="stat-icon used">
                      <el-icon :size="32"><SuccessFilled /></el-icon>
                    </div>
                    <div class="stat-info">
                      <div class="stat-value">{{ stats.used }}</div>
                      <div class="stat-label">已使用</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCardStore } from '@/stores/cardStore'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Key, Plus, List, DataLine, Document, CircleCheck, SuccessFilled } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const cardStore = useCardStore()

const activeMenu = ref('generate')
const generating = ref(false)
const cards = ref([])
const newCards = ref([])
const selectedCards = ref([])
const adminPassword = ref('')

const generateForm = ref({
  count: 10,
  duration: 30,
  type: 'normal'
})

const pageTitle = computed(() => {
  const titles = {
    generate: '生成卡密',
    list: '卡密列表',
    stats: '数据统计'
  }
  return titles[activeMenu.value] || '卡密管理'
})

const stats = computed(() => {
  const total = cards.value.length
  const used = cards.value.filter(c => c.used).length
  const unused = total - used
  return { total, used, unused }
})

const cardTypeText = (type) => {
  const types = {
    normal: '普通版',
    pro: '专业版',
    premium: '尊享版'
  }
  return types[type] || '普通版'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

const handleSelectionChange = (selection) => {
  selectedCards.value = selection
}

const handleGenerate = async () => {
  generating.value = true
  try {
    const result = await cardStore.generateCards(
      adminPassword.value,
      generateForm.value.count,
      generateForm.value.duration,
      generateForm.value.type
    )
    if (result.success) {
      ElMessage.success(result.message)
      newCards.value = result.cards
      if (activeMenu.value === 'list') {
        loadCards()
      }
    } else {
      ElMessage.error(result.message || '生成失败')
    }
  } finally {
    generating.value = false
  }
}

const loadCards = async () => {
  const result = await cardStore.getCards(adminPassword.value)
  if (result.success) {
    cards.value = result.cards
  } else {
    ElMessage.error(result.message || '加载失败')
  }
}

const handleDelete = async (card) => {
  try {
    await ElMessageBox.confirm('确定要删除这个卡密吗？', '确认', {
      type: 'warning'
    })
    const result = await cardStore.deleteCard(adminPassword.value, card.id)
    if (result.success) {
      ElMessage.success('删除成功')
      loadCards()
    } else {
      ElMessage.error(result.message || '删除失败')
    }
  } catch {
  }
}

const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedCards.value.length} 个卡密吗？`, '确认', {
      type: 'warning'
    })
    for (const card of selectedCards.value) {
      if (!card.used) {
        await cardStore.deleteCard(adminPassword.value, card.id)
      }
    }
    ElMessage.success('批量删除成功')
    selectedCards.value = []
    loadCards()
  } catch {
  }
}

const copyCard = (key) => {
  navigator.clipboard.writeText(key)
  ElMessage.success('已复制')
}

const copyAllCards = () => {
  const keys = newCards.value.map(c => c.key).join('\n')
  navigator.clipboard.writeText(keys)
  ElMessage.success('已复制全部卡密')
}

const exportCards = (cardsToExport) => {
  const content = cardsToExport
    .filter(c => !c.used)
    .map(c => `${c.key}\t${cardTypeText(c.type)}\t${c.duration}天\t${formatDate(c.createdAt)}`)
    .join('\n')
  
  const header = '卡密\t类型\t天数\t创建时间\n'
  const blob = new Blob(['\ufeff' + header + content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `卡密_${new Date().toLocaleDateString('zh-CN')}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

const exportSelected = () => {
  if (selectedCards.value.length === 0) {
    ElMessage.warning('请先选择要导出的卡密')
    return
  }
  exportCards(selectedCards.value)
}

const exportAll = () => {
  if (cards.value.length === 0) {
    ElMessage.warning('没有卡密可导出')
    return
  }
  exportCards(cards.value)
}

const goBack = () => {
  router.push('/card-verify')
}

onMounted(() => {
  adminPassword.value = route.query.pwd || ''
  if (!adminPassword.value) {
    router.push('/card-verify')
    return
  }
  loadCards()
})
</script>

<style scoped>
.card-admin-container {
  height: 100vh;
}

.admin-layout {
  height: 100%;
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
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid #374151;
}

.sidebar-menu {
  flex: 1;
  border: none;
}

.logout-section {
  padding: 16px;
  border-top: 1px solid #374151;
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

.main-content {
  overflow: auto;
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons {
  display: flex;
  gap: 8px;
}

.new-cards-list {
  max-height: 400px;
  overflow-y: auto;
}

.card-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.card-item:last-child {
  border-bottom: none;
}

.card-index {
  color: #6b7280;
  width: 30px;
}

.card-key {
  font-family: monospace;
  font-size: 14px;
}

.card-info {
  flex: 1;
  color: #6b7280;
}

.stat-card {
  margin-bottom: 24px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.unused {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.stat-icon.used {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #1f2937;
}

.stat-label {
  color: #6b7280;
  font-size: 14px;
}
</style>

<template>
  <div class="card-verify-container">
    <div class="verify-card">
      <div class="logo-section">
        <el-icon :size="64" color="#3b82f6"><Document /></el-icon>
        <h1>小说创作大师</h1>
        <p>AI 智能写作软件</p>
      </div>

      <div v-if="cardStore.isActivated && !cardStore.isExpired" class="activated-section">
        <el-result icon="success" title="已激活">
          <template #sub-title>
            <div class="activation-info">
              <p>卡密类型: {{ cardTypeText }}</p>
              <p>剩余天数: <span class="days-count">{{ cardStore.remainingDays }}</span> 天</p>
              <p>过期时间: {{ formatDate(cardStore.expiresAt) }}</p>
            </div>
          </template>
          <template #extra>
            <el-button type="primary" @click="goToApp">进入应用</el-button>
            <el-button @click="cardStore.logout">退出激活</el-button>
          </template>
        </el-result>
      </div>

      <div v-else-if="cardStore.isActivated && cardStore.isExpired" class="expired-section">
        <el-result icon="warning" title="已过期">
          <template #sub-title>
            <p>您的激活已过期，请重新输入卡密</p>
          </template>
          <template #extra>
            <el-button type="primary" @click="showVerify = true">重新激活</el-button>
          </template>
        </el-result>
      </div>

      <div v-else class="verify-section">
        <el-form :model="form" label-position="top">
          <el-form-item label="请输入卡密">
            <el-input
              v-model="form.cardKey"
              placeholder="输入 16 位卡密"
              maxlength="16"
              show-word-limit
              size="large"
              @keyup.enter="handleVerify"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              style="width: 100%"
              :loading="cardStore.loading"
              @click="handleVerify"
            >
              激活
            </el-button>
          </el-form-item>
        </el-form>

        <div class="admin-link">
          <el-link type="info" @click="showAdminLogin = true">管理员入口</el-link>
        </div>
      </div>
    </div>

    <el-dialog v-model="showAdminLogin" title="管理员登录" width="400px">
      <el-form :model="adminForm" label-position="top">
        <el-form-item label="管理密码">
          <el-input
            v-model="adminForm.password"
            type="password"
            show-password
            placeholder="请输入管理密码"
            @keyup.enter="handleAdminLogin"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAdminLogin = false">取消</el-button>
        <el-button type="primary" :loading="adminLoading" @click="handleAdminLogin">登录</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCardStore } from '@/stores/cardStore'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'

const router = useRouter()
const cardStore = useCardStore()

const showVerify = ref(true)
const showAdminLogin = ref(false)
const adminLoading = ref(false)

const form = ref({
  cardKey: ''
})

const adminForm = ref({
  password: ''
})

const cardTypeText = computed(() => {
  const types = {
    normal: '普通版',
    pro: '专业版',
    premium: '尊享版'
  }
  return types[cardStore.cardType] || '普通版'
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

const handleVerify = async () => {
  if (!form.value.cardKey.trim()) {
    ElMessage.warning('请输入卡密')
    return
  }

  const result = await cardStore.verifyCard(form.value.cardKey.trim().toUpperCase())
  if (result.success) {
    ElMessage.success('激活成功！')
    form.value.cardKey = ''
  } else {
    ElMessage.error(result.message || '激活失败')
  }
}

const handleAdminLogin = async () => {
  if (!adminForm.value.password) {
    ElMessage.warning('请输入密码')
    return
  }

  const password = adminForm.value.password
  adminLoading.value = true
  const result = await cardStore.adminLogin(password)
  adminLoading.value = false

  if (result.success) {
    showAdminLogin.value = false
    adminForm.value.password = ''
    router.push({ name: 'CardAdmin', query: { pwd: password } })
  } else {
    ElMessage.error(result.message || '登录失败')
  }
}

const goToApp = () => {
  router.push('/project')
}
</script>

<style scoped>
.card-verify-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.verify-card {
  background: white;
  border-radius: 16px;
  padding: 48px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.logo-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo-section h1 {
  margin: 16px 0 8px;
  font-size: 28px;
  color: #1f2937;
}

.logo-section p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.verify-section {
  margin-top: 32px;
}

.activated-section,
.expired-section {
  margin-top: 20px;
}

.activation-info {
  text-align: left;
  padding: 0 40px;
}

.activation-info p {
  margin: 8px 0;
  color: #6b7280;
}

.days-count {
  font-size: 24px;
  font-weight: bold;
  color: #3b82f6;
}

.admin-link {
  text-align: center;
  margin-top: 24px;
}

.admin-link-bottom {
  text-align: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}
</style>

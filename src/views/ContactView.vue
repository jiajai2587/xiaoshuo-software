<template>
  <div class="contact-view">
    <el-card class="contact-card">
      <template #header>
        <div class="card-header">
          <span>联系我们</span>
        </div>
      </template>
      
      <div class="contact-content">
        <div class="contact-item">
          <el-icon :size="40" color="#3b82f6"><Message /></el-icon>
          <div class="contact-info">
            <h3>邮箱</h3>
            <p class="contact-value" @click="copyEmail">{{ email }}</p>
            <el-button type="primary" size="small" @click="copyEmail">
              <el-icon><DocumentCopy /></el-icon>
              复制邮箱
            </el-button>
          </div>
        </div>
        
        <div class="contact-divider"></div>
        
        <div class="contact-item">
          <el-icon :size="40" color="#07c160"><ChatDotRound /></el-icon>
          <div class="contact-info">
            <h3>微信</h3>
            <p class="contact-value" @click="copyWechat">{{ wechat }}</p>
            <el-button type="success" size="small" @click="copyWechat">
              <el-icon><DocumentCopy /></el-icon>
              复制微信号
            </el-button>
          </div>
        </div>
      </div>
      
      <div class="contact-footer">
        <el-divider />
        <p class="footer-text">如果您在使用过程中有任何问题或建议，欢迎随时联系我们！</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const email = ref('2742938881@qq.com')
const wechat = ref('2742938881')

const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText(email.value)
    ElMessage.success('邮箱已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

const copyWechat = async () => {
  try {
    await navigator.clipboard.writeText(wechat.value)
    ElMessage.success('微信号已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}
</script>

<style scoped>
.contact-view {
  max-width: 600px;
  margin: 0 auto;
}

.contact-card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.contact-content {
  padding: 20px 0;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px;
}

.contact-info {
  flex: 1;
}

.contact-info h3 {
  margin: 0 0 12px 0;
  color: #1f2937;
  font-size: 18px;
}

.contact-value {
  margin: 0 0 12px 0;
  color: #3b82f6;
  font-size: 20px;
  font-weight: 500;
  cursor: pointer;
  user-select: all;
}

.contact-value:hover {
  text-decoration: underline;
}

.contact-divider {
  height: 1px;
  background-color: #e5e7eb;
  margin: 0 20px;
}

.contact-footer {
  text-align: center;
}

.footer-text {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}
</style>

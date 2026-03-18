<template>
  <div class="api-view">
    <el-card class="api-card">
      <template #header>
        <div class="card-header">
          <span>API 接口配置</span>
        </div>
      </template>
      
      <el-form :model="apiConfig" label-width="120px">
        <el-form-item label="API 地址">
          <el-input v-model="apiConfig.baseUrl" placeholder="例如: https://api.deepseek.com" />
        </el-form-item>
        
        <el-form-item label="API 密钥">
          <el-input v-model="apiConfig.apiKey" type="password" show-password placeholder="请输入您的 API 密钥" />
        </el-form-item>
        
        <el-form-item label="模型名称">
          <el-select v-model="apiConfig.model" placeholder="请选择模型">
            <el-option label="deepseek-chat" value="deepseek-chat" />
            <el-option label="deepseek-coder" value="deepseek-coder" />
            <el-option label="gpt-4" value="gpt-4" />
            <el-option label="gpt-3.5-turbo" value="gpt-3.5-turbo" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="温度参数">
          <el-slider v-model="apiConfig.temperature" :min="0" :max="2" :step="0.1" show-input />
        </el-form-item>
        
        <el-form-item label="最大Token数">
          <el-input-number v-model="apiConfig.maxTokens" :min="100" :max="128000" :step="100" />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="saveConfig">保存配置</el-button>
          <el-button @click="resetConfig">重置</el-button>
          <el-button @click="testConnection">测试连接</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="api-card" style="margin-top: 24px;">
      <template #header>
        <div class="card-header">
          <span>API 使用说明</span>
        </div>
      </template>
      
      <div class="api-instructions">
        <h4>获取 API 密钥</h4>
        <p>1. 访问 DeepSeek 官网：https://platform.deepseek.com</p>
        <p>2. 注册并登录账号</p>
        <p>3. 在 API Keys 页面创建新的 API Key</p>
        <p>4. 复制 API Key 并填入上方配置中</p>
        
        <h4 style="margin-top: 24px;">参数说明</h4>
        <ul>
          <li><strong>温度参数</strong>：控制生成的随机性，值越高越随机（推荐 0.7-1.0）</li>
          <li><strong>最大Token数</strong>：单次生成的最大长度，根据需要调整</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const apiConfig = ref({
  baseUrl: 'https://api.deepseek.com',
  apiKey: '',
  model: 'deepseek-chat',
  temperature: 0.7,
  maxTokens: 4000
})

const saveConfig = () => {
  localStorage.setItem('novelApiConfig', JSON.stringify(apiConfig.value))
  ElMessage.success('配置已保存')
}

const resetConfig = () => {
  apiConfig.value = {
    baseUrl: 'https://api.deepseek.com',
    apiKey: '',
    model: 'deepseek-chat',
    temperature: 0.7,
    maxTokens: 4000
  }
  ElMessage.info('配置已重置')
}

const testConnection = async () => {
  if (!apiConfig.value.apiKey) {
    ElMessage.warning('请先输入 API 密钥')
    return
  }
  
  ElMessage.info('正在测试连接...')
  
  try {
    const response = await fetch(`${apiConfig.value.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiConfig.value.apiKey}`
      },
      body: JSON.stringify({
        model: apiConfig.value.model,
        messages: [{ role: 'user', content: '你好' }],
        max_tokens: 10
      })
    })
    
    if (response.ok) {
      ElMessage.success('连接成功！')
    } else {
      const error = await response.json()
      ElMessage.error(`连接失败：${error.message || response.statusText}`)
    }
  } catch (error) {
    ElMessage.error(`连接失败：${error.message}`)
  }
}

onMounted(() => {
  const saved = localStorage.getItem('novelApiConfig')
  if (saved) {
    apiConfig.value = JSON.parse(saved)
  }
})
</script>

<style scoped>
.api-view {
  max-width: 800px;
  margin: 0 auto;
}

.api-card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.api-instructions h4 {
  color: #1f2937;
  margin-bottom: 12px;
}

.api-instructions p {
  color: #4b5563;
  margin: 8px 0;
  line-height: 1.6;
}

.api-instructions ul {
  color: #4b5563;
  margin: 8px 0;
  padding-left: 20px;
}

.api-instructions li {
  margin: 8px 0;
  line-height: 1.6;
}
</style>

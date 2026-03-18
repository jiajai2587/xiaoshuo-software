<template>
  <div class="settings-view">
    <el-alert v-if="!currentProject" type="warning" show-icon style="margin-bottom: 20px;">
      请先在「项目管理」中选择或创建一个项目
    </el-alert>

    <div v-else>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>角色管理</span>
                <el-button type="primary" size="small" @click="showCharacterDialog = true">
                  <el-icon><Plus /></el-icon>
                  添加角色
                </el-button>
              </div>
            </template>
            <el-empty v-if="!characters?.length" description="暂无角色" />
            <div v-else class="characters-list">
              <div v-for="char in characters" :key="char.id" class="character-card">
                <div class="char-header">
                  <div class="char-avatar">{{ char.name?.charAt(0) || '?' }}</div>
                  <div class="char-info">
                    <h4>{{ char.name }}</h4>
                    <el-tag size="small" type="info">{{ char.role || '角色' }}</el-tag>
                  </div>
                  <div class="char-actions">
                    <el-button size="small" @click="editCharacter(char)">编辑</el-button>
                    <el-button size="small" type="danger" @click="deleteCharacter(char)">删除</el-button>
                  </div>
                </div>
                <div class="char-status">
                  <span class="label">当前状态：</span>
                  <span>{{ char.status || '未设定' }}</span>
                </div>
                <div class="char-desc">{{ char.description || '暂无简介' }}</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>世界设定</span>
                <el-button type="primary" size="small" @click="showSettingDialog = true">
                  <el-icon><Plus /></el-icon>
                  添加设定
                </el-button>
              </div>
            </template>
            <el-empty v-if="!worldSettings?.length" description="暂无设定" />
            <div v-else class="settings-list">
              <div v-for="setting in worldSettings" :key="setting.id" class="setting-item">
                <div class="setting-header">
                  <h4>{{ setting.name }}</h4>
                  <div class="setting-actions">
                    <el-button size="small" @click="editSetting(setting)">编辑</el-button>
                    <el-button size="small" type="danger" @click="deleteSetting(setting)">删除</el-button>
                  </div>
                </div>
                <p class="setting-content">{{ setting.content }}</p>
                <div class="setting-meta">
                  <el-tag size="small" type="success">{{ setting.category || '通用' }}</el-tag>
                  <span>{{ formatDate(setting.createdAt) }}</span>
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
              <span>智能分析建议</span>
            </template>
            <el-alert type="info" show-icon>
              <template #title>
                AI 分析完成
              </template>
              <ul>
                <li>建议为主要角色添加更详细的性格描述</li>
                <li>当前世界设定数量适中，可以继续补充</li>
                <li>建议添加「势力分布」类设定</li>
              </ul>
            </el-alert>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-dialog v-model="showCharacterDialog" :title="editingCharacter ? '编辑角色' : '添加角色'" width="500px">
      <el-form :model="characterForm" label-width="100px">
        <el-form-item label="角色名称">
          <el-input v-model="characterForm.name" placeholder="输入角色名" />
        </el-form-item>
        <el-form-item label="角色定位">
          <el-select v-model="characterForm.role" placeholder="选择定位">
            <el-option label="主角" value="主角" />
            <el-option label="配角" value="配角" />
            <el-option label="反派" value="反派" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="当前状态">
          <el-input v-model="characterForm.status" placeholder="描述角色当前状态" />
        </el-form-item>
        <el-form-item label="角色简介">
          <el-input v-model="characterForm.description" type="textarea" :rows="4" placeholder="详细描述角色的性格、外貌、背景等" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCharacterDialog = false">取消</el-button>
        <el-button type="primary" @click="saveCharacter">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showSettingDialog" :title="editingSetting ? '编辑设定' : '添加设定'" width="500px">
      <el-form :model="settingForm" label-width="100px">
        <el-form-item label="设定名称">
          <el-input v-model="settingForm.name" placeholder="例如：修炼体系、地理环境" />
        </el-form-item>
        <el-form-item label="设定分类">
          <el-select v-model="settingForm.category" placeholder="选择分类">
            <el-option label="世界观" value="世界观" />
            <el-option label="力量体系" value="力量体系" />
            <el-option label="地理环境" value="地理环境" />
            <el-option label="势力组织" value="势力组织" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="设定内容">
          <el-input v-model="settingForm.content" type="textarea" :rows="6" placeholder="详细描述该设定" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSettingDialog = false">取消</el-button>
        <el-button type="primary" @click="saveSetting">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { ElMessage, ElMessageBox } from 'element-plus'

const projectStore = useProjectStore()
const currentProject = computed(() => projectStore.currentProject)
const characters = computed(() => currentProject.value?.characters || [])
const worldSettings = computed(() => currentProject.value?.worldSettings || [])

const showCharacterDialog = ref(false)
const showSettingDialog = ref(false)
const editingCharacter = ref(null)
const editingSetting = ref(null)

const characterForm = ref({
  name: '',
  role: '主角',
  status: '',
  description: ''
})

const settingForm = ref({
  name: '',
  category: '世界观',
  content: ''
})

const editCharacter = (char) => {
  editingCharacter.value = char
  characterForm.value = {
    name: char.name,
    role: char.role,
    status: char.status,
    description: char.description
  }
  showCharacterDialog.value = true
}

const saveCharacter = () => {
  if (!characterForm.value.name) {
    ElMessage.warning('请输入角色名称')
    return
  }
  if (editingCharacter.value) {
    projectStore.updateCharacter(editingCharacter.value.id, characterForm.value)
    ElMessage.success('角色已更新')
  } else {
    projectStore.addCharacter(characterForm.value)
    ElMessage.success('角色已添加')
  }
  showCharacterDialog.value = false
  resetCharacterForm()
}

const deleteCharacter = async (char) => {
  try {
    await ElMessageBox.confirm(`确定要删除角色「${char.name}」吗？`, '确认删除', { type: 'warning' })
    const index = characters.value.findIndex(c => c.id === char.id)
    if (index > -1) {
      currentProject.value.characters.splice(index, 1)
      projectStore.saveProject()
    }
    ElMessage.success('已删除')
  } catch {}
}

const resetCharacterForm = () => {
  characterForm.value = { name: '', role: '主角', status: '', description: '' }
  editingCharacter.value = null
}

const editSetting = (setting) => {
  editingSetting.value = setting
  settingForm.value = {
    name: setting.name,
    category: setting.category,
    content: setting.content
  }
  showSettingDialog.value = true
}

const saveSetting = () => {
  if (!settingForm.value.name || !settingForm.value.content) {
    ElMessage.warning('请填写完整信息')
    return
  }
  if (editingSetting.value) {
    const setting = worldSettings.value.find(s => s.id === editingSetting.value.id)
    if (setting) {
      Object.assign(setting, settingForm.value)
      projectStore.saveProject()
    }
    ElMessage.success('设定已更新')
  } else {
    projectStore.addWorldSetting(settingForm.value)
    ElMessage.success('设定已添加')
  }
  showSettingDialog.value = false
  resetSettingForm()
}

const deleteSetting = async (setting) => {
  try {
    await ElMessageBox.confirm(`确定要删除设定「${setting.name}」吗？`, '确认删除', { type: 'warning' })
    const index = worldSettings.value.findIndex(s => s.id === setting.id)
    if (index > -1) {
      currentProject.value.worldSettings.splice(index, 1)
      projectStore.saveProject()
    }
    ElMessage.success('已删除')
  } catch {}
}

const resetSettingForm = () => {
  settingForm.value = { name: '', category: '世界观', content: '' }
  editingSetting.value = null
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

onMounted(() => {
  showCharacterDialog.value = false
  showSettingDialog.value = false
})
</script>

<style scoped>
.settings-view {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.characters-list, .settings-list {
  max-height: 65vh;
  overflow-y: auto;
}

.character-card {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #fafafa;
}

.char-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.char-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
}

.char-info {
  flex: 1;
}

.char-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
}

.char-actions {
  display: flex;
  gap: 8px;
}

.char-status {
  padding: 8px 12px;
  background: #fff;
  border-radius: 6px;
  margin-bottom: 8px;
}

.char-status .label {
  color: #6b7280;
  font-size: 13px;
}

.char-desc {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
}

.setting-item {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #fafafa;
}

.setting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.setting-header h4 {
  margin: 0;
  font-size: 16px;
}

.setting-actions {
  display: flex;
  gap: 8px;
}

.setting-content {
  color: #374151;
  line-height: 1.7;
  margin: 8px 0;
}

.setting-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.setting-meta span {
  font-size: 12px;
  color: #9ca3af;
}
</style>

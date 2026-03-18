<template>
  <div class="project-view">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="projects-card">
          <template #header>
            <div class="card-header">
              <span>我的项目</span>
              <el-button type="primary" @click="showCreateDialog = true">
                <el-icon><Plus /></el-icon>
                新建项目
              </el-button>
            </div>
          </template>
          <el-empty v-if="projects.length === 0" description="暂无项目，点击上方按钮创建">
            <el-button type="primary" @click="showCreateDialog = true">创建项目</el-button>
          </el-empty>
          <el-row :gutter="20" v-else>
            <el-col :span="12" v-for="project in projects" :key="project.id">
              <el-card 
                class="project-card" 
                :class="{ active: currentProject?.id === project.id }"
                shadow="hover"
                @click="selectProject(project)"
              >
                <div class="project-card-content">
                  <div class="project-icon">
                    <el-icon :size="40"><Document /></el-icon>
                  </div>
                  <div class="project-info">
                    <h3>{{ project.name }}</h3>
                    <p class="project-desc">{{ project.description || '暂无描述' }}</p>
                    <div class="project-meta">
                      <span>{{ project.chapters?.length || 0 }} 章</span>
                      <span>{{ formatDate(project.createdAt) }}</span>
                    </div>
                  </div>
                </div>
                <div class="project-actions">
                  <el-button size="small" @click.stop="editProject(project)">编辑</el-button>
                  <el-button size="small" type="danger" @click.stop="deleteProject(project)">删除</el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="quick-start-card">
          <template #header>
            <span>快速入门</span>
          </template>
          <el-steps direction="vertical" :active="3">
            <el-step title="创建项目" description="配置作者角色和创作规则" />
            <el-step title="生成大纲" description="输入创意，AI生成章节大纲" />
            <el-step title="创作内容" description="基于大纲生成小说正文" />
            <el-step title="导出发布" description="支持多平台格式导出" />
          </el-steps>
        </el-card>
        <el-card class="tips-card" style="margin-top: 20px;">
          <template #header>
            <span>使用提示</span>
          </template>
          <ul class="tips-list">
            <li>先在「捕获进度」中登录 DeepSeek 账号</li>
            <li>详细的世界设定能提升生成质量</li>
            <li>逐章生成可更好控制情节走向</li>
            <li>定期保存项目数据</li>
          </ul>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="showCreateDialog" title="创建新项目" width="600px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="项目名称">
          <el-input v-model="formData.name" placeholder="给你的小说起个名字" />
        </el-form-item>
        <el-form-item label="项目描述">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="简单描述一下你的故事" />
        </el-form-item>
        <el-form-item label="作者角色">
          <el-input v-model="formData.authorRole" type="textarea" :rows="2" placeholder="定义AI的作者身份" />
        </el-form-item>
        <el-form-item label="创作规则">
          <el-input v-model="formData.writingRules" type="textarea" :rows="2" placeholder="设定写作风格和规则" />
        </el-form-item>
        <el-form-item label="目标字数">
          <el-input-number v-model="formData.targetWordCount" :min="500" :max="10000" :step="100" />
          <span style="margin-left: 10px; color: #999;">字/章</span>
        </el-form-item>
        <el-form-item label="发布平台">
          <el-select v-model="formData.platform" placeholder="选择平台">
            <el-option label="番茄小说" value="番茄" />
            <el-option label="七猫小说" value="七猫" />
            <el-option label="知乎" value="知乎" />
            <el-option label="通用" value="通用" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createProject">创建</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showEditDialog" title="编辑项目" width="600px">
      <el-form :model="editFormData" label-width="100px">
        <el-form-item label="项目名称">
          <el-input v-model="editFormData.name" />
        </el-form-item>
        <el-form-item label="项目描述">
          <el-input v-model="editFormData.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="作者角色">
          <el-input v-model="editFormData.authorRole" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="创作规则">
          <el-input v-model="editFormData.writingRules" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="目标字数">
          <el-input-number v-model="editFormData.targetWordCount" :min="500" :max="10000" :step="100" />
        </el-form-item>
        <el-form-item label="发布平台">
          <el-select v-model="editFormData.platform">
            <el-option label="番茄小说" value="番茄" />
            <el-option label="七猫小说" value="七猫" />
            <el-option label="知乎" value="知乎" />
            <el-option label="通用" value="通用" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveProjectEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/projectStore'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const projectStore = useProjectStore()

const projects = computed(() => projectStore.projects)
const currentProject = computed(() => projectStore.currentProject)

const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const editingProject = ref(null)

const formData = ref({
  name: '',
  description: '',
  authorRole: '你是一位资深的网络小说作家，擅长创作引人入胜的故事，文笔流畅，情节紧凑。',
  writingRules: '1. 语言口语化，符合网络小说风格\n2. 每章设置悬念，吸引读者继续阅读\n3. 人物形象鲜明，性格突出\n4. 节奏适中，张弛有度',
  targetWordCount: 2000,
  platform: '番茄'
})

const editFormData = ref({})

const createProject = async () => {
  if (!formData.value.name) {
    ElMessage.warning('请输入项目名称')
    return
  }
  await projectStore.createProject(formData.value)
  showCreateDialog.value = false
  ElMessage.success('项目创建成功')
  formData.value = {
    name: '',
    description: '',
    authorRole: '你是一位资深的网络小说作家，擅长创作引人入胜的故事，文笔流畅，情节紧凑。',
    writingRules: '1. 语言口语化，符合网络小说风格\n2. 每章设置悬念，吸引读者继续阅读\n3. 人物形象鲜明，性格突出\n4. 节奏适中，张弛有度',
    targetWordCount: 2000,
    platform: '番茄'
  }
}

const selectProject = async (project) => {
  await projectStore.loadProject(project.id)
  ElMessage.success(`已选择项目：${project.name}`)
}

const editProject = (project) => {
  editingProject.value = project
  editFormData.value = {
    name: project.name,
    description: project.description,
    authorRole: project.config?.authorRole,
    writingRules: project.config?.writingRules,
    targetWordCount: project.config?.targetWordCount,
    platform: project.config?.platform
  }
  showEditDialog.value = true
}

const saveProjectEdit = async () => {
  if (!editFormData.value.name) {
    ElMessage.warning('请输入项目名称')
    return
  }
  const project = projects.value.find(p => p.id === editingProject.value.id)
  if (project) {
    project.name = editFormData.value.name
    project.description = editFormData.value.description
    project.config = {
      ...project.config,
      authorRole: editFormData.value.authorRole,
      writingRules: editFormData.value.writingRules,
      targetWordCount: editFormData.value.targetWordCount,
      platform: editFormData.value.platform
    }
    await projectStore.saveProjects()
    if (currentProject.value?.id === project.id) {
      currentProject.value.name = project.name
      currentProject.value.description = project.description
      currentProject.value.config = project.config
      await projectStore.saveProject()
    }
  }
  showEditDialog.value = false
  ElMessage.success('项目更新成功')
}

const deleteProject = async (project) => {
  try {
    await ElMessageBox.confirm(`确定要删除项目「${project.name}」吗？此操作不可恢复。`, '确认删除', {
      type: 'warning'
    })
    const index = projects.value.findIndex(p => p.id === project.id)
    if (index > -1) {
      projects.value.splice(index, 1)
      await projectStore.saveProjects()
      if (currentProject.value?.id === project.id) {
        projectStore.currentProject = null
      }
      ElMessage.success('项目已删除')
    }
  } catch {
  }
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.project-view {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.project-card:hover {
  transform: translateY(-2px);
}

.project-card.active {
  border: 2px solid #3b82f6;
}

.project-card-content {
  display: flex;
  gap: 16px;
}

.project-icon {
  color: #3b82f6;
  display: flex;
  align-items: center;
}

.project-info {
  flex: 1;
}

.project-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #111827;
}

.project-desc {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-meta {
  font-size: 12px;
  color: #9ca3af;
  display: flex;
  gap: 16px;
}

.project-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.tips-list {
  margin: 0;
  padding-left: 20px;
  color: #6b7280;
  line-height: 2;
}
</style>

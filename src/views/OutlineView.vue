<template>
  <div class="outline-view">
    <el-alert v-if="!currentProject" type="warning" show-icon style="margin-bottom: 20px;">
      请先在「项目管理」中选择或创建一个项目
    </el-alert>

    <div v-else>
      <el-row :gutter="20">
        <el-col :span="10">
          <el-card>
            <template #header>
              <span>生成章节大纲</span>
            </template>
            <el-form :model="outlineForm" label-width="100px">
              <el-form-item label="故事创意">
                <el-input 
                  v-model="outlineForm.idea" 
                  type="textarea" 
                  :rows="6" 
                  placeholder="描述你的故事创意、主题、核心情节等..."
                />
              </el-form-item>
              <el-form-item label="章节数量">
                <el-input-number v-model="outlineForm.chapterCount" :min="1" :max="50" />
              </el-form-item>
              <el-form-item label="风格类型">
                <el-select v-model="outlineForm.genre" placeholder="选择风格">
                  <el-option label="玄幻" value="玄幻" />
                  <el-option label="都市" value="都市" />
                  <el-option label="仙侠" value="仙侠" />
                  <el-option label="言情" value="言情" />
                  <el-option label="悬疑" value="悬疑" />
                  <el-option label="科幻" value="科幻" />
                  <el-option label="其他" value="其他" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="generateOutline" :loading="generating">
                  <el-icon><MagicStick /></el-icon>
                  生成大纲
                </el-button>
                <el-button @click="generateNextChapter" :disabled="chapters.length === 0" :loading="generatingNext">
                  续写一章
                </el-button>
              </el-form-item>
            </el-form>

            <el-divider />

            <div>
              <h4>提示词预览</h4>
              <el-input
                type="textarea"
                :rows="8"
                :model-value="buildPrompt()"
                readonly
              />
            </div>
          </el-card>
        </el-col>

        <el-col :span="14">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>章节大纲列表 ({{ chapters.length }}章)</span>
                <el-button size="small" @click="saveAllChapters" :disabled="chapters.length === 0">
                  <el-icon><Download /></el-icon>
                  保存全部
                </el-button>
              </div>
            </template>

            <el-empty v-if="chapters.length === 0" description="尚未生成章节大纲" />

            <div v-else class="chapters-list">
              <div 
                v-for="(chapter, index) in chapters" 
                :key="index"
                class="chapter-item"
              >
                <div class="chapter-header">
                  <span class="chapter-number">第{{ chapter.number }}章</span>
                  <el-input 
                    v-model="chapter.title" 
                    placeholder="章节标题"
                    size="small"
                    style="flex: 1; margin: 0 12px;"
                  />
                  <div class="chapter-actions">
                    <el-button size="small" @click="editChapter(index)">编辑</el-button>
                    <el-button size="small" type="primary" @click="saveChapter(index)">保存</el-button>
                    <el-button size="small" type="danger" @click="removeChapter(index)">删除</el-button>
                  </div>
                </div>
                <el-input
                  v-model="chapter.outline"
                  type="textarea"
                  :rows="4"
                  placeholder="章节大纲内容..."
                />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-dialog v-model="showEditDialog" title="编辑章节" width="700px">
      <el-form label-width="100px">
        <el-form-item label="章节标题">
          <el-input v-model="editingChapter.title" />
        </el-form-item>
        <el-form-item label="章节大纲">
          <el-input v-model="editingChapter.outline" type="textarea" :rows="10" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmEdit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { ElMessage } from 'element-plus'

const projectStore = useProjectStore()
const currentProject = computed(() => projectStore.currentProject)

const outlineForm = ref({
  idea: '',
  chapterCount: 10,
  genre: '玄幻'
})

const chapters = ref([])
const generating = ref(false)
const generatingNext = ref(false)
const showEditDialog = ref(false)
const editingIndex = ref(-1)
const editingChapter = ref({ title: '', outline: '' })

const buildPrompt = () => {
  if (!currentProject.value) return ''
  
  const config = currentProject.value.config || {}
  return `${config.authorRole || ''}

请根据以下信息创作小说章节大纲：

【故事创意】
${outlineForm.value.idea || '（待补充）'}

【风格类型】${outlineForm.value.genre}
【章节数量】${outlineForm.value.chapterCount}章

【创作规则】
${config.writingRules || ''}

请按照以下JSON格式返回：
{
  "chapters": [
    {
      "number": 1,
      "title": "章节标题",
      "outline": "详细的章节大纲，包括情节、人物互动、关键事件等"
    }
  ]
}

注意：
1. 确保每章都有明确的起承转合
2. 章节之间要有连贯性
3. 每章结尾设置悬念
4. 符合${config.platform || '番茄'}平台风格`
}

const generateOutline = async () => {
  if (!currentProject.value) {
    ElMessage.warning('请先选择一个项目')
    return
  }
  if (!outlineForm.value.idea) {
    ElMessage.warning('请输入故事创意')
    return
  }

  generating.value = true
  projectStore.addLog({ type: 'info', message: '开始生成章节大纲...' })

  try {
    await new Promise(resolve => setTimeout(resolve, 1500))

    const sampleChapters = []
    for (let i = 1; i <= outlineForm.value.chapterCount; i++) {
      sampleChapters.push({
        number: i,
        title: `第${i}章 示例标题`,
        outline: `这是第${i}章的大纲内容。在这里描述本章的主要情节发展、人物出场、关键事件等。请根据你的故事创意修改此内容。`
      })
    }

    chapters.value = sampleChapters
    projectStore.addLog({ type: 'success', message: `成功生成${sampleChapters.length}章大纲` })
    ElMessage.success('大纲生成成功！请在右侧编辑和保存。')
  } catch (error) {
    projectStore.addLog({ type: 'error', message: '生成大纲失败: ' + error.message })
    ElMessage.error('生成失败，请重试')
  } finally {
    generating.value = false
  }
}

const generateNextChapter = async () => {
  if (!currentProject.value) return

  generatingNext.value = true
  projectStore.addLog({ type: 'info', message: '正在续写新章节...' })

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const nextNum = chapters.value.length + 1
    chapters.value.push({
      number: nextNum,
      title: `第${nextNum}章 续写章节`,
      outline: '这是续写章节的大纲内容。'
    })
    projectStore.addLog({ type: 'success', message: '续写成功' })
    ElMessage.success('续写成功')
  } catch (error) {
    projectStore.addLog({ type: 'error', message: '续写失败' })
  } finally {
    generatingNext.value = false
  }
}

const editChapter = (index) => {
  editingIndex.value = index
  editingChapter.value = { ...chapters.value[index] }
  showEditDialog.value = true
}

const confirmEdit = () => {
  if (editingIndex.value > -1) {
    chapters.value[editingIndex.value] = { ...editingChapter.value }
  }
  showEditDialog.value = false
}

const removeChapter = (index) => {
  chapters.value.splice(index, 1)
  chapters.value.forEach((c, i) => {
    c.number = i + 1
  })
}

const saveChapter = async (index) => {
  if (!currentProject.value) return
  const chapter = chapters.value[index]
  const existing = currentProject.value.chapters.find(c => c.number === chapter.number)
  
  if (existing) {
    projectStore.updateChapter(existing.id, {
      title: chapter.title,
      outline: chapter.outline
    })
  } else {
    projectStore.addChapter(chapter)
  }
  projectStore.addLog({ type: 'success', message: `第${chapter.number}章已保存` })
  ElMessage.success('保存成功')
}

const saveAllChapters = async () => {
  if (!currentProject.value) return
  for (const chapter of chapters.value) {
    const existing = currentProject.value.chapters.find(c => c.number === chapter.number)
    if (existing) {
      projectStore.updateChapter(existing.id, {
        title: chapter.title,
        outline: chapter.outline
      })
    } else {
      projectStore.addChapter(chapter)
    }
  }
  projectStore.addLog({ type: 'success', message: `已保存${chapters.value.length}章` })
  ElMessage.success('全部保存成功')
}

onMounted(() => {
  if (currentProject.value?.chapters) {
    chapters.value = currentProject.value.chapters.map(c => ({
      number: c.number,
      title: c.title,
      outline: c.outline
    }))
  }
})
</script>

<style scoped>
.outline-view {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chapters-list {
  max-height: 70vh;
  overflow-y: auto;
}

.chapter-item {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 16px;
  background: #fafafa;
}

.chapter-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.chapter-number {
  font-weight: bold;
  color: #3b82f6;
  white-space: nowrap;
}

.chapter-actions {
  display: flex;
  gap: 8px;
}
</style>

<template>
  <div class="generate-view">
    <el-alert v-if="!currentProject" type="warning" show-icon style="margin-bottom: 20px;">
      请先在「项目管理」中选择或创建一个项目
    </el-alert>

    <div v-else>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card>
            <template #header>
              <span>章节列表</span>
            </template>
            <el-empty v-if="projectChapters.length === 0" description="暂无章节，请先在「章节大纲」中生成" />
            <div v-else class="chapter-list">
              <div 
                v-for="chapter in projectChapters" 
                :key="chapter.id"
                class="chapter-item"
                :class="{ active: selectedChapter?.id === chapter.id }"
                @click="selectChapter(chapter)"
              >
                <div class="chapter-info">
                  <span class="chapter-num">第{{ chapter.number }}章</span>
                  <span class="chapter-title">{{ chapter.title }}</span>
                </div>
                <el-tag :type="getStatusType(chapter.status)" size="small">
                  {{ getStatusText(chapter.status) }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="18">
          <el-card v-if="selectedChapter">
            <template #header>
              <div class="card-header">
                <span>{{ selectedChapter.title }}</span>
                <div class="header-actions">
                  <el-button size="small" @click="copyPrompt">
                    <el-icon><DocumentCopy /></el-icon>
                    复制提示词
                  </el-button>
                  <el-button size="small" type="primary" @click="generateContent" :loading="generating">
                    <el-icon><MagicStick /></el-icon>
                    生成内容
                  </el-button>
                  <el-button size="small" type="success" @click="saveContent" :disabled="!selectedChapter.content">
                    <el-icon><Check /></el-icon>
                    保存
                  </el-button>
                </div>
              </div>
            </template>

            <el-row :gutter="20">
              <el-col :span="24">
                <div class="options-bar">
                  <el-checkbox v-model="options.useCharacters">使用角色状态</el-checkbox>
                  <el-checkbox v-model="options.useWorldSettings">引用世界设定</el-checkbox>
                  <el-checkbox v-model="options.usePreviousChapters">关联前面章节</el-checkbox>
                  <el-checkbox v-model="options.autoExpand">自动扩写</el-checkbox>
                  <el-input-number 
                    v-model="options.targetWords" 
                    :min="500" 
                    :max="20000" 
                    size="small"
                    style="width: 140px; margin-left: 10px;"
                  />
                  <span style="margin-left: 8px;">字</span>
                </div>
              </el-col>
            </el-row>

            <el-divider />

            <el-row :gutter="20">
              <el-col :span="12">
                <div class="section-title">
                  <span>章节大纲</span>
                </div>
                <el-input
                  v-model="selectedChapter.outline"
                  type="textarea"
                  :rows="10"
                  readonly
                />
              </el-col>
              <el-col :span="12">
                <div class="section-title">
                  <span>正文内容 ({{ contentWordCount }}字)</span>
                </div>
                <el-input
                  v-model="selectedChapter.content"
                  type="textarea"
                  :rows="10"
                  placeholder="正文内容将在这里显示..."
                />
              </el-col>
            </el-row>

            <el-divider />

            <div class="section-title">
              <span>AI 生成提示词</span>
            </div>
            <el-input
              type="textarea"
              :rows="8"
              :model-value="buildGeneratePrompt()"
              readonly
            />

            <div v-if="stateUpdates.length > 0" style="margin-top: 20px;">
              <el-alert type="info" show-icon title="智能状态更新建议">
                <div v-for="(update, i) in stateUpdates" :key="i" class="update-item">
                  <span>{{ update.type }}: {{ update.target }}</span>
                  <p>{{ update.suggestion }}</p>
                  <el-button size="small" type="primary" @click="applyUpdate(i)">应用</el-button>
                </div>
              </el-alert>
            </div>
          </el-card>

          <el-empty v-else description="请从左侧选择一个章节" />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { ElMessage } from 'element-plus'

const projectStore = useProjectStore()
const currentProject = computed(() => projectStore.currentProject)
const projectChapters = computed(() => currentProject.value?.chapters || [])

const selectedChapter = ref(null)
const generating = ref(false)
const stateUpdates = ref([])

const options = ref({
  useCharacters: true,
  useWorldSettings: true,
  usePreviousChapters: true,
  autoExpand: true,
  targetWords: 2000
})

const contentWordCount = computed(() => {
  return selectedChapter.value?.content?.length || 0
})

const selectChapter = (chapter) => {
  selectedChapter.value = chapter
  if (currentProject.value?.config?.targetWordCount) {
    options.value.targetWords = currentProject.value.config.targetWordCount
  }
}

const getStatusType = (status) => {
  const types = {
    outline: 'info',
    generating: 'warning',
    done: 'success'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    outline: '大纲完成',
    generating: '生成中',
    done: '已完成'
  }
  return texts[status] || '未知'
}

const buildGeneratePrompt = () => {
  if (!currentProject.value || !selectedChapter.value) return ''

  const config = currentProject.value.config || {}
  let prompt = `${config.authorRole || ''}

【章节信息】
第${selectedChapter.value.number}章：${selectedChapter.value.title}

【章节大纲】
${selectedChapter.value.outline}

`

  if (options.value.useCharacters && currentProject.value.characters?.length > 0) {
    prompt += `【角色状态】
`
    currentProject.value.characters.forEach(char => {
      prompt += `- ${char.name}: ${char.status || '无状态记录'}
`
      if (char.description) prompt += `  简介: ${char.description}
`
    })
    prompt += '\n'
  }

  if (options.value.useWorldSettings && currentProject.value.worldSettings?.length > 0) {
    prompt += `【世界设定】
`
    currentProject.value.worldSettings.forEach(setting => {
      prompt += `- ${setting.name}: ${setting.content}
`
    })
    prompt += '\n'
  }

  if (options.value.usePreviousChapters) {
    const prevChapters = currentProject.value.chapters.filter(c => c.number < selectedChapter.value.number && c.content)
    if (prevChapters.length > 0) {
      prompt += `【前情提要】
`
      prevChapters.slice(-3).forEach(c => {
        prompt += `第${c.number}章概要: ${c.outline.substring(0, 100)}...
`
      })
      prompt += '\n'
    }
  }

  prompt += `【创作规则】
${config.writingRules || ''}

【目标字数】约${options.value.targetWords}字

【平台风格】${config.platform || '番茄'}平台

请根据以上信息创作完整的章节内容。要求：
1. 严格遵循章节大纲
2. 保持角色性格一致
3. 语言流畅自然
4. 章节结尾设置悬念
5. ${options.value.autoExpand ? '内容丰富详细，达到目标字数' : '内容精炼'}`

  return prompt
}

const generateContent = async () => {
  if (!currentProject.value || !selectedChapter.value) {
    ElMessage.warning('请先选择章节')
    return
  }

  generating.value = true
  projectStore.updateChapter(selectedChapter.value.id, { status: 'generating' })
  projectStore.addLog({ type: 'info', message: `开始生成第${selectedChapter.value.number}章内容...` })

  try {
    await new Promise(resolve => setTimeout(resolve, 2000))

    const sampleContent = `这是第${selectedChapter.value.number}章的正文内容示例。

在这里，故事将按照大纲逐步展开。人物依次登场，情节逐渐推进。

"你来了。"某人说道。

"是的，我来了。"主角回答。

对话继续，情节发展...

（本章结束，未完待续）`

    selectedChapter.value.content = sampleContent
    projectStore.updateChapter(selectedChapter.value.id, { 
      content: sampleContent, 
      status: 'done',
      wordCount: sampleContent.length
    })

    stateUpdates.value = [
      {
        type: '角色状态',
        target: '主角',
        suggestion: '建议更新主角状态：从「初入秘境」更新为「获得宝物」'
      },
      {
        type: '世界设定',
        target: '秘境规则',
        suggestion: '建议补充设定：秘境时间流速为外界10倍'
      }
    ]

    projectStore.addLog({ type: 'success', message: `第${selectedChapter.value.number}章生成完成，${sampleContent.length}字` })
    ElMessage.success('生成成功！')
  } catch (error) {
    projectStore.addLog({ type: 'error', message: '生成失败: ' + error.message })
    ElMessage.error('生成失败，请重试')
  } finally {
    generating.value = false
  }
}

const copyPrompt = async () => {
  const prompt = buildGeneratePrompt()
  await navigator.clipboard.writeText(prompt)
  ElMessage.success('提示词已复制到剪贴板')
}

const saveContent = () => {
  if (!selectedChapter.value) return
  projectStore.updateChapter(selectedChapter.value.id, {
    content: selectedChapter.value.content,
    wordCount: selectedChapter.value.content.length
  })
  projectStore.addLog({ type: 'success', message: `第${selectedChapter.value.number}章已保存` })
  ElMessage.success('保存成功')
}

const applyUpdate = (index) => {
  ElMessage.success('已应用更新建议')
  stateUpdates.value.splice(index, 1)
}

onMounted(() => {
  if (projectChapters.value.length > 0) {
    selectedChapter.value = projectChapters.value[0]
  }
})
</script>

<style scoped>
.generate-view {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.chapter-list {
  max-height: 75vh;
  overflow-y: auto;
}

.chapter-item {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.chapter-item:hover {
  border-color: #3b82f6;
}

.chapter-item.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.chapter-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.chapter-num {
  font-weight: bold;
  color: #374151;
  font-size: 13px;
}

.chapter-title {
  font-size: 14px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.options-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.section-title {
  font-weight: 600;
  margin-bottom: 12px;
  color: #374151;
}

.update-item {
  padding: 12px;
  background: #f0f9ff;
  border-radius: 6px;
  margin-bottom: 8px;
}

.update-item p {
  margin: 8px 0;
  color: #6b7280;
}
</style>

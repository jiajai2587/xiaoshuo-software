import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null }

export const useProjectStore = defineStore('project', () => {
  const currentProject = ref(null)
  const projects = ref([])
  const appPath = ref('')

  const loadProjects = async () => {
    if (!ipcRenderer) return
    try {
      const path = await ipcRenderer.invoke('get-app-path')
      appPath.value = path
      const result = await ipcRenderer.invoke('read-file', `${path}/projects.json`)
      if (result.success) {
        projects.value = JSON.parse(result.content)
      }
    } catch (e) {
      console.log('No projects file yet')
    }
  }

  const saveProjects = async () => {
    if (!ipcRenderer) return
    await ipcRenderer.invoke('save-file', {
      filePath: `${appPath.value}/projects.json`,
      content: JSON.stringify(projects.value, null, 2)
    })
  }

  const createProject = async (projectData) => {
    const project = {
      id: Date.now().toString(),
      name: projectData.name,
      description: projectData.description,
      createdAt: new Date().toISOString(),
      config: {
        authorRole: projectData.authorRole || '你是一位资深的网络小说作家，擅长创作引人入胜的故事。',
        writingRules: projectData.writingRules || '语言流畅，情节紧凑，人物鲜明。',
        targetWordCount: projectData.targetWordCount || 2000,
        platform: projectData.platform || '番茄'
      },
      chapters: [],
      characters: [],
      worldSettings: [],
      logs: []
    }
    projects.value.push(project)
    currentProject.value = project
    await saveProjects()
    await saveProject(project)
    return project
  }

  const saveProject = async (project = currentProject.value) => {
    if (!ipcRenderer || !project) return
    const projectPath = `${appPath.value}/projects/${project.id}`
    await ipcRenderer.invoke('save-file', {
      filePath: `${projectPath}/project.json`,
      content: JSON.stringify(project, null, 2)
    })
  }

  const loadProject = async (projectId) => {
    const project = projects.value.find(p => p.id === projectId)
    if (project && ipcRenderer) {
      const projectPath = `${appPath.value}/projects/${projectId}`
      const result = await ipcRenderer.invoke('read-file', `${projectPath}/project.json`)
      if (result.success) {
        currentProject.value = JSON.parse(result.content)
      } else {
        currentProject.value = project
      }
    }
    return currentProject.value
  }

  const addChapter = (chapter) => {
    if (!currentProject.value) return
    const newChapter = {
      id: Date.now().toString(),
      number: currentProject.value.chapters.length + 1,
      title: chapter.title,
      outline: chapter.outline,
      content: '',
      wordCount: 0,
      status: 'outline',
      createdAt: new Date().toISOString()
    }
    currentProject.value.chapters.push(newChapter)
    saveProject()
    saveProjects()
    return newChapter
  }

  const updateChapter = (chapterId, updates) => {
    if (!currentProject.value) return
    const chapter = currentProject.value.chapters.find(c => c.id === chapterId)
    if (chapter) {
      Object.assign(chapter, updates)
      chapter.wordCount = chapter.content ? chapter.content.length : 0
      saveProject()
    }
  }

  const addCharacter = (character) => {
    if (!currentProject.value) return
    const newCharacter = {
      id: Date.now().toString(),
      ...character,
      status: character.status || '初始状态',
      createdAt: new Date().toISOString()
    }
    currentProject.value.characters.push(newCharacter)
    saveProject()
    return newCharacter
  }

  const updateCharacter = (characterId, updates) => {
    if (!currentProject.value) return
    const character = currentProject.value.characters.find(c => c.id === characterId)
    if (character) {
      Object.assign(character, updates)
      saveProject()
    }
  }

  const addWorldSetting = (setting) => {
    if (!currentProject.value) return
    const newSetting = {
      id: Date.now().toString(),
      ...setting,
      createdAt: new Date().toISOString()
    }
    currentProject.value.worldSettings.push(newSetting)
    saveProject()
    return newSetting
  }

  const addLog = (log) => {
    if (!currentProject.value) return
    const newLog = {
      id: Date.now().toString(),
      ...log,
      timestamp: new Date().toISOString()
    }
    currentProject.value.logs.unshift(newLog)
    if (currentProject.value.logs.length > 100) {
      currentProject.value.logs = currentProject.value.logs.slice(0, 100)
    }
    saveProject()
  }

  return {
    currentProject,
    projects,
    appPath,
    loadProjects,
    saveProjects,
    createProject,
    saveProject,
    loadProject,
    addChapter,
    updateChapter,
    addCharacter,
    updateCharacter,
    addWorldSetting,
    addLog
  }
})

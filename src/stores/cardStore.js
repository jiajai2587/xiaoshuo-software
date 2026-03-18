import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API_BASE } from '@/config/api'

export const useCardStore = defineStore('card', () => {
  const isActivated = ref(false)
  const expiresAt = ref(null)
  const cardType = ref(null)
  const loading = ref(false)

  const isExpired = computed(() => {
    if (!expiresAt.value) return true
    return new Date(expiresAt.value) < new Date()
  })

  const remainingDays = computed(() => {
    if (!expiresAt.value) return 0
    const diff = new Date(expiresAt.value) - new Date()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  })

  const loadActivation = () => {
    const saved = localStorage.getItem('card_activation')
    if (saved) {
      const data = JSON.parse(saved)
      isActivated.value = true
      expiresAt.value = data.expiresAt
      cardType.value = data.type
    }
  }

  const saveActivation = (data) => {
    localStorage.setItem('card_activation', JSON.stringify({
      expiresAt: data.expiresAt,
      type: data.type
    }))
  }

  const verifyCard = async (cardKey) => {
    loading.value = true
    try {
      const response = await fetch(`${API_BASE}/cards/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardKey })
      })
      const data = await response.json()
      if (data.success) {
        isActivated.value = true
        expiresAt.value = data.card.expiresAt
        cardType.value = data.card.type
        saveActivation(data.card)
      }
      return data
    } catch (e) {
      return { success: false, message: '连接服务器失败' }
    } finally {
      loading.value = false
    }
  }

  const adminLogin = async (password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      return await response.json()
    } catch (e) {
      return { success: false, message: '连接服务器失败' }
    }
  }

  const generateCards = async (password, count, duration, type) => {
    try {
      const response = await fetch(`${API_BASE}/cards/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, count, duration, type })
      })
      return await response.json()
    } catch (e) {
      return { success: false, message: '连接服务器失败' }
    }
  }

  const getCards = async (password) => {
    try {
      const response = await fetch(`${API_BASE}/cards?password=${encodeURIComponent(password)}`)
      return await response.json()
    } catch (e) {
      return { success: false, message: '连接服务器失败' }
    }
  }

  const deleteCard = async (password, id) => {
    try {
      const response = await fetch(`${API_BASE}/cards/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      return await response.json()
    } catch (e) {
      return { success: false, message: '连接服务器失败' }
    }
  }

  const logout = () => {
    isActivated.value = false
    expiresAt.value = null
    cardType.value = null
    localStorage.removeItem('card_activation')
  }

  return {
    isActivated,
    expiresAt,
    cardType,
    loading,
    isExpired,
    remainingDays,
    loadActivation,
    verifyCard,
    adminLogin,
    generateCards,
    getCards,
    deleteCard,
    logout
  }
})

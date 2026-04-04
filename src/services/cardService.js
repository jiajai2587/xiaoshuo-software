/**
 * 卡片服务 - 处理卡密验证和管理相关 API 调用
 */
import { API_BASE, post, get, del } from './api'

/**
 * 验证卡密
 * @param {string} cardKey - 卡密
 * @returns {Promise<any>}
 */
export const verifyCard = async (cardKey) => {
  return post(`${API_BASE}/cards/verify`, { cardKey })
}

/**
 * 管理员登录
 * @param {string} password - 管理密码
 * @returns {Promise<any>}
 */
export const adminLogin = async (password) => {
  return post(`${API_BASE}/auth/admin`, { password })
}

/**
 * 生成卡密
 * @param {string} password - 管理密码
 * @param {number} count - 数量
 * @param {number} duration - 有效天数
 * @param {string} type - 卡密类型
 * @returns {Promise<any>}
 */
export const generateCards = async (password, count, duration, type) => {
  return post(`${API_BASE}/cards/generate`, { password, count, duration, type })
}

/**
 * 获取卡密列表
 * @param {string} password - 管理密码
 * @returns {Promise<any>}
 */
export const getCards = async (password) => {
  return get(`${API_BASE}/cards?password=${encodeURIComponent(password)}`)
}

/**
 * 删除卡密
 * @param {string} password - 管理密码
 * @param {string} id - 卡密 ID
 * @returns {Promise<any>}
 */
export const deleteCard = async (password, id) => {
  return del(`${API_BASE}/cards/${id}`, { password })
}

export default {
  verifyCard,
  adminLogin,
  generateCards,
  getCards,
  deleteCard
}

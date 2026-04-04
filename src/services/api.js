/**
 * API 服务基础配置
 */

// API 基础地址
const getLocalIP = () => {
  const hostname = window.location.hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'localhost'
  }
  return hostname
}

const localIP = getLocalIP()
export const API_BASE = import.meta.env.VITE_API_BASE || `http://${localIP}:3000/api`

// 请求超时时间（毫秒）
export const REQUEST_TIMEOUT = 10000

// 重试次数
export const MAX_RETRIES = 3

/**
 * 发起 HTTP 请求
 * @param {string} url - 请求 URL
 * @param {RequestInit} options - 请求选项
 * @param {number} retries - 重试次数
 * @returns {Promise<any>}
 */
export const request = async (url, options = {}, retries = 0) => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    if (retries < MAX_RETRIES && error.name !== 'AbortError') {
      await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)))
      return request(url, options, retries + 1)
    }
    throw error
  }
}

/**
 * GET 请求
 * @param {string} url - 请求 URL
 * @param {Record<string, string>} headers - 请求头
 * @returns {Promise<any>}
 */
export const get = (url, headers = {}) => {
  return request(url, { method: 'GET', headers })
}

/**
 * POST 请求
 * @param {string} url - 请求 URL
 * @param {any} data - 请求数据
 * @param {Record<string, string>} headers - 请求头
 * @returns {Promise<any>}
 */
export const post = (url, data, headers = {}) => {
  return request(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers
  })
}

/**
 * DELETE 请求
 * @param {string} url - 请求 URL
 * @param {any} data - 请求数据
 * @param {Record<string, string>} headers - 请求头
 * @returns {Promise<any>}
 */
export const del = (url, data, headers = {}) => {
  return request(url, {
    method: 'DELETE',
    body: JSON.stringify(data),
    headers
  })
}

export default {
  API_BASE,
  REQUEST_TIMEOUT,
  MAX_RETRIES,
  request,
  get,
  post,
  del
}

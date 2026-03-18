const getLocalIP = () => {
  const hostname = window.location.hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'localhost'
  }
  return hostname
}

const localIP = getLocalIP()

export const API_BASE = import.meta.env.VITE_API_BASE || `http://${localIP}:3000/api`

export default {
  API_BASE
}

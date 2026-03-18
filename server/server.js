const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const app = express()
const PORT = 3000

const DATA_DIR = path.join(__dirname, 'data')

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

const CARDS_FILE = path.join(DATA_DIR, 'cards.json')
const ADMIN_PASSWORD = 'liujuan2012'

app.use(cors())
app.use(express.json())

const loadCards = () => {
  if (!fs.existsSync(CARDS_FILE)) {
    return []
  }
  try {
    const data = fs.readFileSync(CARDS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (e) {
    return []
  }
}

const saveCards = (cards) => {
  fs.writeFileSync(CARDS_FILE, JSON.stringify(cards, null, 2))
}

const generateCardKey = () => {
  return crypto.randomBytes(8).toString('hex').toUpperCase()
}

app.post('/api/auth/admin', (req, res) => {
  const { password } = req.body
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, message: '登录成功' })
  } else {
    res.status(401).json({ success: false, message: '密码错误' })
  }
})

app.post('/api/cards/verify', (req, res) => {
  const { cardKey } = req.body
  const cards = loadCards()
  const card = cards.find(c => c.key === cardKey && !c.used)
  
  if (card) {
    card.used = true
    card.usedAt = new Date().toISOString()
    saveCards(cards)
    res.json({ 
      success: true, 
      message: '验证成功',
      card: {
        duration: card.duration,
        type: card.type,
        expiresAt: new Date(Date.now() + card.duration * 24 * 60 * 60 * 1000).toISOString()
      }
    })
  } else {
    const usedCard = cards.find(c => c.key === cardKey)
    if (usedCard) {
      res.status(400).json({ success: false, message: '该卡密已被使用' })
    } else {
      res.status(404).json({ success: false, message: '卡密无效' })
    }
  }
})

app.post('/api/cards/generate', (req, res) => {
  const { password, count, duration, type } = req.body
  
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: '密码错误' })
  }
  
  const cards = loadCards()
  const newCards = []
  
  for (let i = 0; i < count; i++) {
    const cardKey = generateCardKey()
    const newCard = {
      id: Date.now().toString() + i,
      key: cardKey,
      duration: duration || 30,
      type: type || 'normal',
      used: false,
      createdAt: new Date().toISOString()
    }
    newCards.push(newCard)
    cards.push(newCard)
  }
  
  saveCards(cards)
  res.json({ success: true, message: `成功生成 ${count} 个卡密`, cards: newCards })
})

app.get('/api/cards', (req, res) => {
  const { password } = req.query
  
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: '密码错误' })
  }
  
  const cards = loadCards()
  res.json({ success: true, cards })
})

app.delete('/api/cards/:id', (req, res) => {
  const { password } = req.body
  const { id } = req.params
  
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: '密码错误' })
  }
  
  let cards = loadCards()
  cards = cards.filter(c => c.id !== id)
  saveCards(cards)
  res.json({ success: true, message: '删除成功' })
})

const os = require('os')

const getLocalIP = () => {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return 'localhost'
}

const localIP = getLocalIP()

app.listen(PORT, '0.0.0.0', () => {
  console.log(`卡密服务器已启动!`)
  console.log(`本地访问: http://localhost:${PORT}`)
  console.log(`局域网访问: http://${localIP}:${PORT}`)
  console.log(`管理密码: ${ADMIN_PASSWORD}`)
})

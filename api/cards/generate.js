import { VercelKV } from '@vercel/kv'

const kv = new VercelKV({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

const CARDS_KEY = 'cards'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'liujuan2012'

async function loadCards() {
  try {
    const data = await kv.get(CARDS_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error('Load cards error:', e)
    return []
  }
}

async function saveCards(cards) {
  await kv.set(CARDS_KEY, JSON.stringify(cards))
}

function generateCardKey() {
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join('')
}

export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  const { method } = req
  
  if (method === 'POST') {
    try {
      const body = await req.json()
      const { password, count, duration, type } = body
      
      if (password !== ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ success: false, message: '密码错误' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      const cards = await loadCards()
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
      
      await saveCards(cards)
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: `成功生成 ${count} 个卡密`, 
        cards: newCards 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Generate cards error:', error)
      return new Response(JSON.stringify({ success: false, message: '服务器错误' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  })
}

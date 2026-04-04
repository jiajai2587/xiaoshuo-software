import { VercelKV } from '@vercel/kv'

// 初始化 Vercel KV 连接
const kv = new VercelKV({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

const CARDS_KEY = 'cards'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'liujuan2012'

// 加载所有卡密
async function loadCards() {
  try {
    const data = await kv.get(CARDS_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error('Load cards error:', e)
    return []
  }
}

// 保存卡密
async function saveCards(cards) {
  await kv.set(CARDS_KEY, JSON.stringify(cards))
}

// 生成卡密密钥
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
      const { cardKey } = body
      
      const cards = await loadCards()
      const cardIndex = cards.findIndex(c => c.key === cardKey && !c.used)
      
      if (cardIndex !== -1) {
        cards[cardIndex].used = true
        cards[cardIndex].usedAt = new Date().toISOString()
        await saveCards(cards)
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: '验证成功',
          card: {
            duration: cards[cardIndex].duration,
            type: cards[cardIndex].type,
            expiresAt: new Date(Date.now() + cards[cardIndex].duration * 24 * 60 * 60 * 1000).toISOString()
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      } else {
        const usedCard = cards.find(c => c.key === cardKey)
        if (usedCard) {
          return new Response(JSON.stringify({ success: false, message: '该卡密已被使用' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          })
        } else {
          return new Response(JSON.stringify({ success: false, message: '卡密无效' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          })
        }
      }
    } catch (error) {
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

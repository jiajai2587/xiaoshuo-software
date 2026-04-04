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

export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  const { method } = req
  
  if (method === 'GET') {
    try {
      const { searchParams } = new URL(req.url)
      const password = searchParams.get('password')
      
      if (password !== ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ success: false, message: '密码错误' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      const cards = await loadCards()
      
      return new Response(JSON.stringify({ success: true, cards }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Get cards error:', error)
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

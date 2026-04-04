const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'liujuan2012'

export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  const { method } = req
  
  if (method === 'POST') {
    try {
      const body = await req.json()
      const { password } = body
      
      if (password === ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ 
          success: true, 
          message: '登录成功' 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      } else {
        return new Response(JSON.stringify({ 
          success: false, 
          message: '密码错误' 
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    } catch (error) {
      console.error('Auth error:', error)
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

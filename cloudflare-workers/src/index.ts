// Cloudflare Workers API 网关
// 作为 Supabase 的代理层，提供额外的安全性和功能

import { createClient } from '@supabase/supabase-js'
import { Router } from 'itty-router'

// Supabase 配置 (从环境变量获取)
const SUPABASE_URL = 'https://your-project-id.supabase.co'
const SUPABASE_SERVICE_KEY = 'your-service-role-key'

// CORS 配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info',
  'Access-Control-Max-Age': '86400',
}

// 创建 Supabase 客户端 (使用服务角色密钥)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// 创建路由器
const router = Router()

// CORS 中间件
function cors(request: Request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }
}

// 验证 JWT Token
async function verifyAuth(request: Request): Promise<{ userId: string } | null> {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !user) {
      return null
    }

    return { userId: user.id }
  } catch (error) {
    console.error('Auth verification error:', error)
    return null
  }
}

// 通用响应函数
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  })
}

// 错误响应函数
function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status)
}

// 用户管理接口
router.get('/users/:userId', async (request, env, ctx) => {
  const auth = await verifyAuth(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  const userId = request.params.userId
  if (auth.userId !== userId) return errorResponse('Forbidden', 403)

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return errorResponse(error.message, 400)
  return jsonResponse(data)
})

router.put('/users/:userId', async (request, env, ctx) => {
  const auth = await verifyAuth(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  const userId = request.params.userId
  if (auth.userId !== userId) return errorResponse('Forbidden', 403)

  try {
    const updateData = await request.json()
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) return errorResponse(error.message, 400)
    return jsonResponse(data)
  } catch (error) {
    return errorResponse('Invalid JSON', 400)
  }
})

// 事件管理接口
router.get('/events', async (request, env, ctx) => {
  const auth = await verifyAuth(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '10')
  const search = url.searchParams.get('search') || ''

  let query = supabaseAdmin
    .from('events')
    .select(`
      *,
      event_members!inner(
        user_id,
        role
      )
    `)
    .eq('event_members.user_id', auth.userId)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  const { from, to } = { from: (page - 1) * limit, to: page * limit - 1 }
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) return errorResponse(error.message, 400)
  return jsonResponse({
    events: data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  })
})

router.get('/events/:eventId', async (request, env, ctx) => {
  const auth = await verifyAuth(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  const eventId = request.params.eventId

  // 检查用户是否有权限访问该事件
  const { data: membership, error: membershipError } = await supabaseAdmin
    .from('event_members')
    .select('role')
    .eq('event_id', eventId)
    .eq('user_id', auth.userId)
    .single()

  if (membershipError || !membership) {
    return errorResponse('Event not found or access denied', 404)
  }

  const { data, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (error) return errorResponse(error.message, 400)
  return jsonResponse(data)
})

router.post('/events', async (request, env, ctx) => {
  const auth = await verifyAuth(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  try {
    const eventData = await request.json()
    
    // 添加创建者ID
    eventData.creator_id = auth.userId

    const { data, error } = await supabaseAdmin
      .from('events')
      .insert(eventData)
      .select()
      .single()

    if (error) return errorResponse(error.message, 400)

    // 将创建者添加为事件所有者
    await supabaseAdmin
      .from('event_members')
      .insert({
        event_id: data.id,
        user_id: auth.userId,
        role: 'owner'
      })

    return jsonResponse(data, 201)
  } catch (error) {
    return errorResponse('Invalid JSON', 400)
  }
})

router.put('/events/:eventId', async (request, env, ctx) => {
  const auth = await verifyAuth(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  const eventId = request.params.eventId

  // 检查权限 (admin 或 owner)
  const { data: membership, error: membershipError } = await supabaseAdmin
    .from('event_members')
    .select('role')
    .eq('event_id', eventId)
    .eq('user_id', auth.userId)
    .single()

  if (membershipError || !membership || !['admin', 'owner'].includes(membership.role)) {
    return errorResponse('Access denied', 403)
  }

  try {
    const updateData = await request.json()
    const { data, error } = await supabaseAdmin
      .from('events')
      .update(updateData)
      .eq('id', eventId)
      .select()
      .single()

    if (error) return errorResponse(error.message, 400)
    return jsonResponse(data)
  } catch (error) {
    return errorResponse('Invalid JSON', 400)
  }
})

router.delete('/events/:eventId', async (request, env, ctx) => {
  const auth = await verifyAuth(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  const eventId = request.params.eventId

  // 只有 owner 可以删除事件
  const { data: membership, error: membershipError } = await supabaseAdmin
    .from('event_members')
    .select('role')
    .eq('event_id', eventId)
    .eq('user_id', auth.userId)
    .single()

  if (membershipError || !membership || membership.role !== 'owner') {
    return errorResponse('Access denied', 403)
  }

  const { error } = await supabaseAdmin
    .from('events')
    .delete()
    .eq('id', eventId)

  if (error) return errorResponse(error.message, 400)
  return jsonResponse({ success: true })
})

// 任务管理接口
router.get('/events/:eventId/tasks', async (request, env, ctx) => {
  const auth = await verifyAuth(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  const eventId = request.params.eventId

  // 检查访问权限
  const { data: membership, error: membershipError } = await supabaseAdmin
    .from('event_members')
    .select('role')
    .eq('event_id', eventId)
    .eq('user_id', auth.userId)
    .single()

  if (membershipError || !membership) {
    return errorResponse('Access denied', 403)
  }

  const { data, error } = await supabaseAdmin
    .from('tasks')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })

  if (error) return errorResponse(error.message, 400)
  return jsonResponse(data)
})

router.post('/events/:eventId/tasks', async (request, env, ctx) => {
  const auth = await verifyAuth(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  const eventId = request.params.eventId

  // 检查权限 (member 及以上可以创建任务)
  const { data: membership, error: membershipError } = await supabaseAdmin
    .from('event_members')
    .select('role')
    .eq('event_id', eventId)
    .eq('user_id', auth.userId)
    .single()

  if (membershipError || !membership) {
    return errorResponse('Access denied', 403)
  }

  try {
    const taskData = await request.json()
    taskData.event_id = eventId
    taskData.created_by = auth.userId

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .insert(taskData)
      .select()
      .single()

    if (error) return errorResponse(error.message, 400)
    return jsonResponse(data, 201)
  } catch (error) {
    return errorResponse('Invalid JSON', 400)
  }
})

// 支出管理接口
router.get('/events/:eventId/expenses', async (request, env, ctx) => {
  const auth = await verifyAuth(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  const eventId = request.params.eventId

  // 检查访问权限
  const { data: membership, error: membershipError } = await supabaseAdmin
    .from('event_members')
    .select('role')
    .eq('event_id', eventId)
    .eq('user_id', auth.userId)
    .single()

  if (membershipError || !membership) {
    return errorResponse('Access denied', 403)
  }

  const { data, error } = await supabaseAdmin
    .from('expenses')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  if (error) return errorResponse(error.message, 400)
  return jsonResponse(data)
})

router.post('/events/:eventId/expenses', async (request, env, ctx) => {
  const auth = await verifyAuth(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  const eventId = request.params.eventId

  // 检查权限
  const { data: membership, error: membershipError } = await supabaseAdmin
    .from('event_members')
    .select('role')
    .eq('event_id', eventId)
    .eq('user_id', auth.userId)
    .single()

  if (membershipError || !membership) {
    return errorResponse('Access denied', 403)
  }

  try {
    const expenseData = await request.json()
    expenseData.event_id = eventId
    expenseData.created_by = auth.userId

    const { data, error } = await supabaseAdmin
      .from('expenses')
      .insert(expenseData)
      .select()
      .single()

    if (error) return errorResponse(error.message, 400)
    return jsonResponse(data, 201)
  } catch (error) {
    return errorResponse('Invalid JSON', 400)
  }
})

// 文件上传接口
router.post('/upload', async (request, env, ctx) => {
  const auth = await verifyAuth(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const path = formData.get('path') as string

    if (!file) return errorResponse('No file provided', 400)

    // 上传到 Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${auth.userId}/${Date.now()}.${fileExt}`
    
    const { data, error } = await supabaseAdmin.storage
      .from('uploads')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) return errorResponse(error.message, 400)

    // 获取公共URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('uploads')
      .getPublicUrl(fileName)

    return jsonResponse({
      fileName,
      publicUrl,
      size: file.size,
      type: file.type
    })
  } catch (error) {
    return errorResponse('Upload failed', 500)
  }
})

// 通知接口
router.post('/notifications', async (request, env, ctx) => {
  const auth = await verifyAuth(request)
  if (!auth) return errorResponse('Unauthorized', 401)

  try {
    const notificationData = await request.json()
    
    // 发送通知 (这里可以集成推送服务)
    console.log('Notification:', notificationData)

    return jsonResponse({ success: true })
  } catch (error) {
    return errorResponse('Invalid JSON', 400)
  }
})

// 健康检查
router.get('/health', async (request, env, ctx) => {
  return jsonResponse({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// 404 处理
router.all('*', async (request, env, ctx) => {
  return errorResponse('Not Found', 404)
})

// 主处理函数
export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    try {
      // CORS 预检请求
      const corsResponse = cors(request)
      if (corsResponse) return corsResponse

      // 路由处理
      return await router.handle(request, env, ctx)
    } catch (error) {
      console.error('Worker error:', error)
      return errorResponse('Internal Server Error', 500)
    }
  }
}

// 类型定义
export interface Env {
  SUPABASE_URL: string
  SUPABASE_SERVICE_KEY: string
}
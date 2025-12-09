import { createClient } from '@supabase/supabase-js'
import Taro from '@tarojs/taro'

// Supabase 配置
const supabaseUrl = process.env.NODE_ENV === 'development' 
  ? 'https://your-project-id.supabase.co' // 开发环境URL
  : process.env.REACT_APP_SUPABASE_URL || 'https://your-project-id.supabase.co' // 生产环境URL

const supabaseAnonKey = process.env.NODE_ENV === 'development'
  ? 'your-anon-key' // 开发环境匿名密钥
  : process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key' // 生产环境匿名密钥

// Cloudflare Workers API URL
const CLOUDFLARE_API_URL = process.env.REACT_APP_CLOUDFLARE_API_URL || 'https://api.yourdomain.com'

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key: string) => {
        // Taro 兼容的存储适配器
        try {
          return Taro.getStorageSync(key)
        } catch (error) {
          console.error('Storage get error:', error)
          return null
        }
      },
      setItem: (key: string, value: string) => {
        try {
          Taro.setStorageSync(key, value)
        } catch (error) {
          console.error('Storage set error:', error)
        }
      },
      removeItem: (key: string) => {
        try {
          Taro.removeStorageSync(key)
        } catch (error) {
          console.error('Storage remove error:', error)
        }
      }
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'wedding-planner-taro'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Cloudflare Workers API 客户端
export class CloudflareAPI {
  private baseURL: string
  private timeout: number

  constructor(baseURL?: string, timeout = 10000) {
    this.baseURL = baseURL || CLOUDFLARE_API_URL
    this.timeout = timeout
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  // 认证相关API
  async getAuthToken() {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
  }

  async authenticatedRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getAuthToken()
    
    return this.request<T>(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  // 用户管理
  async getUserProfile(userId: string) {
    return this.authenticatedRequest(`/users/${userId}`)
  }

  async updateUserProfile(userId: string, data: any) {
    return this.authenticatedRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // 事件管理
  async getEvents(options?: { page?: number; limit?: number; search?: string }) {
    const params = new URLSearchParams()
    if (options?.page) params.append('page', options.page.toString())
    if (options?.limit) params.append('limit', options.limit.toString())
    if (options?.search) params.append('search', options.search)

    const endpoint = `/events${params.toString() ? `?${params.toString()}` : ''}`
    return this.authenticatedRequest(endpoint)
  }

  async getEvent(eventId: string) {
    return this.authenticatedRequest(`/events/${eventId}`)
  }

  async createEvent(data: any) {
    return this.authenticatedRequest('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateEvent(eventId: string, data: any) {
    return this.authenticatedRequest(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteEvent(eventId: string) {
    return this.authenticatedRequest(`/events/${eventId}`, {
      method: 'DELETE',
    })
  }

  // 任务管理
  async getTasks(eventId: string) {
    return this.authenticatedRequest(`/events/${eventId}/tasks`)
  }

  async createTask(eventId: string, data: any) {
    return this.authenticatedRequest(`/events/${eventId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTask(eventId: string, taskId: string, data: any) {
    return this.authenticatedRequest(`/events/${eventId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteTask(eventId: string, taskId: string) {
    return this.authenticatedRequest(`/events/${eventId}/tasks/${taskId}`, {
      method: 'DELETE',
    })
  }

  // 支出管理
  async getExpenses(eventId: string) {
    return this.authenticatedRequest(`/events/${eventId}/expenses`)
  }

  async createExpense(eventId: string, data: any) {
    return this.authenticatedRequest(`/events/${eventId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateExpense(eventId: string, expenseId: string, data: any) {
    return this.authenticatedRequest(`/events/${eventId}/expenses/${expenseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteExpense(eventId: string, expenseId: string) {
    return this.authenticatedRequest(`/events/${eventId}/expenses/${expenseId}`, {
      method: 'DELETE',
    })
  }

  // 文件上传
  async uploadFile(file: File, path: string) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('path', path)

    const token = await this.getAuthToken()
    return fetch(`${this.baseURL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })
  }

  // 通知管理
  async sendNotification(data: {
    title: string
    body: string
    eventId?: string
    userId?: string
    type: 'task' | 'expense' | 'event'
  }) {
    return this.authenticatedRequest('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

// 创建 Cloudflare API 实例
export const cloudflareAPI = new CloudflareAPI()

// 错误处理
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// 响应处理工具
export const handleAPIResponse = async <T>(
  apiCall: () => Promise<T>
): Promise<{ data: T; error: null } | { data: null; error: APIError }> => {
  try {
    const data = await apiCall()
    return { data, error: null }
  } catch (error) {
    console.error('API Error:', error)
    
    if (error instanceof APIError) {
      return { data: null, error }
    }
    
    return {
      data: null,
      error: new APIError(
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }
}

// 重试机制
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      
      // 指数退避
      const waitTime = delay * Math.pow(2, i)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
  
  throw new Error('Max retries exceeded')
}

// 导出默认实例
export default {
  supabase,
  cloudflareAPI,
  CloudflareAPI,
  APIError,
  handleAPIResponse,
  withRetry
}

// 类型定义
export type RealtimeChannel = ReturnType<typeof supabase.channel>

export interface RealtimeEventData {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  schema: string
  commit_timestamp: string
  old_record: any
  new_record: any
}

// 环境变量检查
export const checkEnvironmentVariables = () => {
  const required = [
    'REACT_APP_SUPABASE_URL',
    'REACT_APP_SUPABASE_ANON_KEY'
  ]

  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error('Missing environment variables:', missing)
    return false
  }
  
  return true
}

// 初始化检查
if (!checkEnvironmentVariables()) {
  console.warn('Some environment variables are missing. Please check your .env file.')
}
import Taro from '@tarojs/taro'

// 纯小程序环境的 Supabase 适配器
console.log('加载纯小程序 Supabase 适配器')

export interface User {
  id: string
  email: string
  nickname: string
  avatar?: string
}

export interface AuthResponse {
  user: User | null
  error: string | null
}

export interface Session {
  user: User | null
  token: string | null
}

// 创建小程序专用的模拟 Supabase 客户端
const createMiniProgramSupabase = () => ({
  auth: {
    // 登录
    signIn: async (email: string, password: string): Promise<AuthResponse> => {
      try {
        console.log('小程序登录:', email)
        
        // 演示账号
        if (email === 'demo@example.com' && password === '123456') {
          const user: User = {
            id: 'demo-user-id',
            email: 'demo@example.com',
            nickname: '演示用户',
            avatar: ''
          }
          
          const session: Session = { user, token: 'demo-token-' + Date.now() }
          Taro.setStorageSync('auth_session', session)
          
          return { user, error: null }
        }
        
        // 通用登录逻辑
        if (email && password && password.length >= 6) {
          const user: User = {
            id: 'user-' + Date.now(),
            email,
            nickname: email.split('@')[0],
            avatar: ''
          }
          
          const session: Session = {
            user,
            token: 'token-' + Date.now()
          }
          Taro.setStorageSync('auth_session', session)
          
          return { user, error: null }
        }
        
        return { user: null, error: '请输入有效的邮箱和密码（至少6位）' }
      } catch (error) {
        console.error('登录错误:', error)
        return { user: null, error: '登录失败' }
      }
    },

    // 注册
    signUp: async (email: string, password: string, options?: any): Promise<AuthResponse> => {
      try {
        console.log('小程序注册:', email)
        
        if (!email || !password) {
          return { user: null, error: '请填写邮箱和密码' }
        }

        if (password.length < 6) {
          return { user: null, error: '密码至少需要6位字符' }
        }

        const user: User = {
          id: 'user-' + Date.now(),
          email,
          nickname: options?.data?.nickname || email.split('@')[0],
          avatar: ''
        }
        
        const session: Session = {
          user,
          token: 'token-' + Date.now()
        }
        Taro.setStorageSync('auth_session', session)
        
        return { user, error: null }
      } catch (error) {
        console.error('注册错误:', error)
        return { user: null, error: '注册失败' }
      }
    },

    // 登出
    signOut: async () => {
      try {
        console.log('小程序登出')
        Taro.removeStorageSync('auth_session')
        return { error: null }
      } catch (error) {
        console.error('登出错误:', error)
        return { error: '登出失败' }
      }
    },

    // 获取当前用户
    getUser: async () => {
      try {
        const session: Session = Taro.getStorageSync('auth_session')
        console.log('获取当前用户:', session?.user?.email)
        return { data: { user: session?.user || null }, error: null }
      } catch (error) {
        console.error('获取用户错误:', error)
        return { data: { user: null }, error: null }
      }
    },

    // 获取会话
    getSession: async () => {
      try {
        const session: Session = Taro.getStorageSync('auth_session')
        console.log('获取会话:', !!session?.user)
        return { data: { session }, error: null }
      } catch (error) {
        console.error('获取会话错误:', error)
        return { data: { session: null }, error: null }
      }
    },

    // 监听认证状态变化
    onAuthStateChange: (callback: (event: string, session: Session) => void) => {
      console.log('设置认证状态监听')
      // 小程序环境中简化处理，可以后续扩展为事件监听
      return {
        subscription: {
          unsubscribe: () => {
            console.log('取消认证状态监听')
          }
        }
      }
    }
  },

  // 模拟数据库操作
  from: (table: string) => {
    console.log('数据库操作（小程序演示模式）:', table)
    return ({
      select: (columns = '*') => ({
        eq: (column: string, value: any) => ({
          data: [],
          error: { message: `小程序演示模式：暂不支持查询 ${table} 表的 ${column} = ${value}` },
          then: (resolve: any) => resolve({ data: [], error: null })
        }),
        order: (column: string, options?: any) => ({
          data: [],
          error: { message: `小程序演示模式：暂不支持排序 ${table} 表的 ${column}` },
          then: (resolve: any) => resolve({ data: [], error: null })
        }),
        then: (resolve: any) => resolve({ data: [], error: null })
      }),
      insert: (data: any) => ({
        data: null,
        error: { message: `小程序演示模式：暂不支持插入 ${table} 表` },
        then: (resolve: any) => resolve({ data: null, error: null })
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          data: null,
          error: { message: `小程序演示模式：暂不支持更新 ${table} 表的 ${column} = ${value}` },
          then: (resolve: any) => resolve({ data: null, error: null })
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          data: null,
          error: { message: `小程序演示模式：暂不支持删除 ${table} 表的 ${column} = ${value}` },
          then: (resolve: any) => resolve({ data: null, error: null })
        })
      })
    })
  },

  // 实时功能
  channel: (channelName: string) => {
    console.log('创建实时通道:', channelName)
    return {
      on: (event: string, callback: Function) => {
        console.log('监听实时事件:', event)
        return {
          subscribe: () => ({
            unsubscribe: () => {
              console.log('取消实时监听:', channelName)
            }
          })
        }
      }
    }
  },

  // 存储功能
  storage: {
    from: (bucket: string) => ({
      upload: (path: string, file: any, options?: any) => ({
        data: null,
        error: { message: `小程序演示模式：暂不支持上传到 ${bucket}/${path}` }
      }),
      getPublicUrl: (path: string) => ({
        data: { publicUrl: '' },
        error: null
      }),
      remove: (paths: string[]) => ({
        data: null,
        error: { message: '小程序演示模式：暂不支持文件删除' }
      })
    })
  }
})

// 创建并导出实例
export const supabase = createMiniProgramSupabase()

// 简化的 Cloudflare API（小程序版本）
export class CloudflareAPI {
  constructor() {
    console.log('小程序 Cloudflare API 适配器（未启用）')
  }
  
  async request() {
    return { error: '小程序演示模式：暂不支持远程 API 调用' }
  }
}

// 错误处理
export class APIError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message)
    this.name = 'APIError'
  }
}

// 响应处理工具
export const handleAPIResponse = async function <T>(
  apiCall: () => Promise<T>
): Promise<{ data: T; error: null } | { data: null; error: APIError }> {
  try {
    const data = await apiCall()
    return { data, error: null }
  } catch (error) {
    console.error('API Error:', error)
    return {
      data: null,
      error: new APIError(
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }
}

// 重试机制
export const withRetry = async function <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }
  throw new Error('Max retries exceeded')
}

// 创建 Cloudflare API 实例
export const cloudflareAPI = new CloudflareAPI()

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
  console.log('小程序环境：无需检查环境变量')
  return true
}

// 导出默认实例
export default {
  supabase,
  cloudflareAPI,
  CloudflareAPI,
  APIError,
  handleAPIResponse,
  withRetry,
  checkEnvironmentVariables
}

console.log('小程序 Supabase 适配器加载完成')
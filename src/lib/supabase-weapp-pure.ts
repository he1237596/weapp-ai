// 微信小程序专用 Supabase 适配器
// 这个文件完全避免导入任何 Supabase 相关模块

// 环境检测
const isWeapp = process.env.TARO_ENV === 'weapp'

if (!isWeapp) {
  throw new Error('此文件仅用于微信小程序环境')
}

// 创建基本的数据结构
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

// 模拟数据库响应
export interface DatabaseResponse<T = any> {
  data: T | null
  error: { message: string } | null
}

// 创建小程序专用的 Supabase 模拟客户端
const createSupabaseClient = () => {
  console.log('📱 创建小程序 Supabase 适配器')
  
  return {
    // 认证模块
    auth: {
      // 登录
      signIn: async (email: string, password: string): Promise<AuthResponse> => {
        console.log('🔐 小程序登录尝试:', email)
        
        try {
          // 演示账号快速登录
          if (email === 'demo' && password === 'demo') {
            const user: User = {
              id: 'demo-user-123',
              email: 'demo@example.com',
              nickname: '演示用户',
              avatar: ''
            }
            
            const session: Session = { user, token: 'demo-token-123' }
            wx.setStorageSync('auth_session', session)
            
            console.log('✅ 小程序登录成功:', user.nickname)
            return { user, error: null }
          }
          
          // 通用登录逻辑
          if (email && password && password.length >= 4) {
            const user: User = {
              id: `wx-user-${Date.now()}`,
              email: email.includes('@') ? email : `${email}@wx.local`,
              nickname: email.split('@')[0],
              avatar: ''
            }
            
            const session: Session = {
              user,
              token: `wx-token-${Date.now()}`
            }
            wx.setStorageSync('auth_session', session)
            
            console.log('✅ 小程序登录成功:', user.nickname)
            return { user, error: null }
          }
          
          return { user: null, error: '请输入有效的邮箱和密码（至少4位）' }
        } catch (error) {
          console.error('❌ 登录错误:', error)
          return { user: null, error: '登录失败，请重试' }
        }
      },

      // 注册
      signUp: async (email: string, password: string, options?: any): Promise<AuthResponse> => {
        console.log('📝 小程序注册尝试:', email)
        
        try {
          if (!email || !password) {
            return { user: null, error: '请填写邮箱和密码' }
          }

          if (password.length < 4) {
            return { user: null, error: '密码至少需要4位字符' }
          }

          const user: User = {
            id: `wx-user-${Date.now()}`,
            email: email.includes('@') ? email : `${email}@wx.local`,
            nickname: options?.data?.nickname || email.split('@')[0],
            avatar: ''
          }
          
          const session: Session = {
            user,
            token: `wx-token-${Date.now()}`
          }
          wx.setStorageSync('auth_session', session)
          
          console.log('✅ 小程序注册成功:', user.nickname)
          return { user, error: null }
        } catch (error) {
          console.error('❌ 注册错误:', error)
          return { user: null, error: '注册失败，请重试' }
        }
      },

      // 登出
      signOut: async () => {
        try {
          console.log('🚪 小程序登出')
          wx.removeStorageSync('auth_session')
          return { error: null }
        } catch (error) {
          console.error('❌ 登出错误:', error)
          return { error: '登出失败' }
        }
      },

      // 获取当前用户
      getUser: async (): Promise<DatabaseResponse<{ user: User | null }>> => {
        try {
          const session: Session = wx.getStorageSync('auth_session')
          console.log('👤 获取当前用户:', session?.user?.nickname || '未登录')
          return { data: { user: session?.user || null }, error: null }
        } catch (error) {
          console.error('❌ 获取用户错误:', error)
          return { data: { user: null }, error: null }
        }
      },

      // 获取会话
      getSession: async (): Promise<DatabaseResponse<{ session: Session | null }>> => {
        try {
          const session: Session = wx.getStorageSync('auth_session')
          console.log('🔑 获取会话:', !!session?.user)
          return { data: { session }, error: null }
        } catch (error) {
          console.error('❌ 获取会话错误:', error)
          return { data: { session: null }, error: null }
        }
      },

      // 监听认证状态变化
      onAuthStateChange: (callback: (event: string, session: Session) => void) => {
        console.log('👂 设置认证状态监听')
        // 小程序环境中简化处理
        return {
          subscription: {
            unsubscribe: () => {
              console.log('🔇 取消认证状态监听')
            }
          }
        }
      }
    },

    // 模拟数据库操作
    from: (table: string) => {
      console.log('🗄️ 数据库操作（小程序模式）:', table)
      return {
        select: (columns = '*') => ({
          eq: (column: string, value: any) => ({
            data: [],
            error: { message: `小程序演示模式：暂不支持查询 ${table} 表` },
            then: (resolve: any) => resolve({ data: [], error: null })
          }),
          order: (column: string, options?: any) => ({
            data: [],
            error: { message: `小程序演示模式：暂不支持排序 ${table} 表` },
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
            error: { message: `小程序演示模式：暂不支持更新 ${table} 表` },
            then: (resolve: any) => resolve({ data: null, error: null })
          })
        }),
        delete: () => ({
          eq: (column: string, value: any) => ({
            data: null,
            error: { message: `小程序演示模式：暂不支持删除 ${table} 表` },
            then: (resolve: any) => resolve({ data: null, error: null })
          })
        })
      }
    },

    // 实时功能
    channel: (channelName: string) => {
      console.log('📡 创建实时通道:', channelName)
      return {
        on: (event: string, callback: Function) => {
          console.log('📡 监听实时事件:', event)
          return {
            subscribe: () => ({
              unsubscribe: () => {
                console.log('📡 取消实时监听:', channelName)
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
  }
}

// 创建并导出实例
export const supabase = createSupabaseClient()

// 简化的 Cloudflare API（小程序版本）
export class CloudflareAPI {
  constructor() {
    console.log('☁️ 小程序 Cloudflare API 适配器（未启用）')
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
    console.error('🔥 API Error:', error)
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
      console.log(`🔄 重试 ${i + 1}/${maxRetries}，等待 ${delay}ms`)
      await new Promise(resolve => setTimeout(resolve, delay))
      delay *= 2 // 指数退避
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
  console.log('🔍 小程序环境：无需检查环境变量')
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

console.log('✅ 小程序专用 Supabase 适配器加载完成')
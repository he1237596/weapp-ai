import Taro from '@tarojs/taro'

// 小程序专用的简化认证系统
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

// 模拟 Supabase 客户端
export const supabase = {
  auth: {
    // 登录
    signIn: async (email: string, password: string): Promise<AuthResponse> => {
      try {
        // 简单的模拟登录逻辑
        if (email === 'demo@example.com' && password === '123456') {
          const user: User = {
            id: 'demo-user-id',
            email: 'demo@example.com',
            nickname: '演示用户',
            avatar: ''
          }
          
          // 保存到本地存储
          const session: Session = {
            user,
            token: 'demo-token-' + Date.now()
          }
          Taro.setStorageSync('auth_session', session)
          
          return { user, error: null }
        } else {
          // 模拟其他用户登录
          if (email && password) {
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
        }
        
        return { user: null, error: '邮箱或密码错误' }
      } catch (error) {
        return { user: null, error: '登录失败' }
      }
    },

    // 注册
    signUp: async (email: string, password: string, options: any): Promise<AuthResponse> => {
      try {
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
        return { user: null, error: '注册失败' }
      }
    },

    // 登出
    signOut: async () => {
      try {
        Taro.removeStorageSync('auth_session')
        return { error: null }
      } catch (error) {
        return { error: '登出失败' }
      }
    },

    // 获取当前用户
    getUser: async () => {
      try {
        const session: Session = Taro.getStorageSync('auth_session')
        return { data: { user: session?.user || null }, error: null }
      } catch (error) {
        return { data: { user: null }, error: null }
      }
    },

    // 获取会话
    getSession: async () => {
      try {
        const session: Session = Taro.getStorageSync('auth_session')
        return { data: { session }, error: null }
      } catch (error) {
        return { data: { session: null }, error: null }
      }
    },

    // 监听认证状态变化
    onAuthStateChange: (callback: (event: string, session: Session) => void) => {
      // 小程序中简化处理
    }
  },

  // 模拟数据库操作
  from: (table: string) => ({
    select: () => ({
      eq: (column: string, value: any) => ({
        data: [],
        error: { message: '小程序演示模式：暂不支持数据库操作' }
      })
    }),
    insert: (data: any) => ({
      data: null,
      error: { message: '小程序演示模式：暂不支持数据库操作' }
    }),
    update: (data: any) => ({
      data: null,
      error: { message: '小程序演示模式：暂不支持数据库操作' }
    }),
    delete: () => ({
      data: null,
      error: { message: '小程序演示模式：暂不支持数据库操作' }
    })
  }),

  // 存储适配器
  storage: {
    getItem: (key: string) => Taro.getStorageSync(key) || null,
    setItem: (key: string, value: string) => Taro.setStorageSync(key, value),
    removeItem: (key: string) => Taro.removeStorageSync(key)
  }
}

// 导出默认实例
export default supabase
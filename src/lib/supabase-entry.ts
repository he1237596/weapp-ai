// 根据环境动态选择 Supabase 实现
// 这个文件作为所有 Supabase 导入的统一入口

// 环境判断
const isMiniProgram = process.env.TARO_ENV === 'weapp' || 
                      process.env.TARO_ENV === 'alipay' || 
                      process.env.TARO_ENV === 'swan' ||
                      process.env.TARO_ENV === 'tt'

// 根据环境选择不同的实现
if (isMiniProgram) {
  // 小程序环境：使用纯适配器，完全避免 Supabase 模块
  console.log('📱 加载小程序专用 Supabase 适配器')
  
  // 直接导出小程序适配器的所有内容
  const weappAdapter = require('./supabase-weapp-pure')
  
  // 导出所有模块
  module.exports = weappAdapter.default || weappAdapter
  
} else {
  // H5 环境：异步加载真实 Supabase
  
  // 创建基础占位符
  const placeholderInstance = {
    auth: {
      signIn: async () => ({ user: null, error: '初始化中...' }),
      signUp: async () => ({ user: null, error: '初始化中...' }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => {}
    }
  }
  
  // 占位符工具类
  const PlaceholderCloudflareAPI = class {
    constructor() {}
    async request() { return {} }
  }
  
  const PlaceholderAPIError = class extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'APIError'
    }
  }
  
  const placeholderHandleAPIResponse = async (apiCall: () => Promise<any>) => {
    try {
      const data = await apiCall()
      return { data, error: null }
    } catch (error) {
      return { data: null, error: new PlaceholderAPIError(error instanceof Error ? error.message : 'Unknown error') }
    }
  }
  
  const placeholderWithRetry = async (fn: () => Promise<any>) => {
    return fn()
  }
  
  // 导出占位符
  const placeholderModule = {
    supabase: placeholderInstance,
    cloudflareAPI: new PlaceholderCloudflareAPI(),
    CloudflareAPI: PlaceholderCloudflareAPI,
    APIError: PlaceholderAPIError,
    handleAPIResponse: placeholderHandleAPIResponse,
    withRetry: placeholderWithRetry,
    checkEnvironmentVariables: () => true
  }
  
  // 异步初始化真实的 Supabase（H5 环境）
  const initializeRealSupabase = async () => {
    try {
      console.log('🔄 开始初始化真实 Supabase (H5)')
      
      // 动态导入 Supabase
      const { createClient } = await import('@supabase/supabase-js')
      
      // 导入 Taro
      const Taro = await import('@tarojs/taro')
      
      const supabaseUrl = 'https://rrvqigvhddwvxwagatxi.supabase.co'
      const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJydnFpZ3ZoZGR3dnh3YWdhdHhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTg2NTYsImV4cCI6MjA4MDgzNDY1Nn0.GY6-wuGqiKpQLL9uXBDgaZ2wQ-HwscJ-iPDpAB_QP1o'
      
      // 创建存储适配器
      const createTaroStorage = () => ({
        getItem: (key: string): string | null => {
          try {
            return Taro.default.getStorageSync(key) || null
          } catch (error) {
            console.error('Storage get error:', error)
            return null
          }
        },
        setItem: (key: string, value: string): void => {
          try {
            Taro.default.setStorageSync(key, value)
          } catch (error) {
            console.error('Storage set error:', error)
          }
        },
        removeItem: (key: string): void => {
          try {
            Taro.default.removeStorageSync(key)
          } catch (error) {
            console.error('Storage remove error:', error)
          }
        }
      })

      // 创建配置
      const config = {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          storage: createTaroStorage()
        },
        global: {
          headers: {
            'X-Client-Info': `wedding-planner-taro-h5`
          }
        },
        realtime: {
          params: {
            eventsPerSecond: 2
          }
        }
      }

      const realSupabase = createClient(supabaseUrl, supabaseAnonKey, config)
      
      // 替换占位符
      Object.assign(placeholderModule, {
        supabase: realSupabase,
        checkEnvironmentVariables: () => {
          console.log('✅ H5 环境变量检查通过')
          return true
        }
      })
      
      console.log('✅ H5 Supabase 初始化成功')
      
    } catch (error) {
      console.error('❌ H5 Supabase 初始化失败，保持占位符:', error)
    }
  }
  
  // 导出占位符模块
  module.exports = placeholderModule
  
  // 异步初始化真实 Supabase
  initializeRealSupabase()
}

console.log('🔧 Supabase 入口文件加载完成')
// 统一日志管理工具
// 在不同环境下控制日志输出级别

class Logger {
  private isDev: boolean
  private isMiniProgram: boolean

  constructor() {
    this.isDev = process.env.NODE_ENV === 'development'
    this.isMiniProgram = process.env.TARO_ENV === 'weapp' || 
                        process.env.TARO_ENV === 'alipay' || 
                        process.env.TARO_ENV === 'swan' ||
                        process.env.TARO_ENV === 'tt'
  }

  // 只在开发环境输出日志
  log(...args: any[]) {
    if (this.isDev && !this.isMiniProgram) {
      console.log(...args)
    }
  }

  // 警告信息，在开发环境和小程序中显示（但小程序中减少频率）
  warn(...args: any[]) {
    if (this.isDev) {
      console.warn(...args)
    }
  }

  // 错误信息，始终显示
  error(...args: any[]) {
    console.error(...args)
  }

  // 信息日志，只在不为小程序的开发环境显示
  info(...args: any[]) {
    if (this.isDev && !this.isMiniProgram) {
      console.info(...args)
    }
  }

  // 调试日志，只在不为小程序的开发环境显示
  debug(...args: any[]) {
    if (this.isDev && !this.isMiniProgram) {
      console.debug(...args)
    }
  }

  // 成功信息，开发环境显示
  success(...args: any[]) {
    if (this.isDev) {
      const message = args.map(arg => 
        typeof arg === 'string' ? `✅ ${arg}` : arg
      )
      console.log(...message)
    }
  }

  // 用户操作日志
  user(action: string, data?: any) {
    if (this.isDev) {
      console.log(`👤 用户操作: ${action}`, data || '')
    }
  }

  // API 请求日志
  api(method: string, url: string, status?: number) {
    if (this.isDev && !this.isMiniProgram) {
      const statusIcon = status ? (status < 400 ? '✅' : '❌') : '🔄'
      console.log(`${statusIcon} API ${method} ${url}`, status || '')
    }
  }

  // 性能日志
  performance(label: string, startTime: number) {
    if (this.isDev && !this.isMiniProgram) {
      const duration = Date.now() - startTime
      console.log(`⏱️ ${label}: ${duration}ms`)
    }
  }
}

// 创建全局日志实例
const logger = new Logger()

export default logger
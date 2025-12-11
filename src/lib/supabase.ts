// 导入环境特定的 Supabase 实现
// 这样可以确保小程序环境不会包含任何 Supabase 模块

const supabaseModule = require('./supabase-entry')

// 解构导出
export const supabase = supabaseModule.supabase
export const cloudflareAPI = supabaseModule.cloudflareAPI
export const CloudflareAPI = supabaseModule.CloudflareAPI
export const APIError = supabaseModule.APIError
export const handleAPIResponse = supabaseModule.handleAPIResponse
export const withRetry = supabaseModule.withRetry
export const checkEnvironmentVariables = supabaseModule.checkEnvironmentVariables

// 类型定义
export type RealtimeChannel = any

export interface RealtimeEventData {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  schema: string
  commit_timestamp: string
  old_record: any
  new_record: any
}

console.log('✅ Supabase 主模块加载完成')
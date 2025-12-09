import { supabase } from '../lib/supabase'
import { UserService } from './database'

interface AuthData {
  email: string
  password: string
  nickname?: string
}
import Taro from '@tarojs/taro'

export class AuthService {
  // 注册
  static async signUp(email: string, password: string, nickname?: string) {
    try {
      // 1. 创建Supabase用户
      const authResult = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname
          }
        }
      })

      if (authResult.error) throw authResult.error

      // 2. 创建用户档案
      if (authResult.user) {
        await UserService.createUserProfile({
          id: authResult.user.id,
          email: authResult.user.email || email,
          nickname: nickname || '用户',
          avatar_url: null
        })
      }

      return authResult
    } catch (error) {
      console.error('注册失败:', error)
      throw error
    }
  }

  // 登录
  static async signIn(email, password) {
    try {
      const signInResult = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInResult.error) throw signInResult.error

      // 获取用户详细信息
      if (signInResult.user) {
        const userProfile = await UserService.getUserProfile(signInResult.user.id)
        return {
          ...signInResult,
          userProfile
        }
      }

      return signInResult
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  // 微信小程序登录
  static async signInWithWechat() {
    try {
      // 获取微信登录码
      const loginRes = await Taro.login()
      if (!loginRes.code) {
        throw new Error('获取微信登录码失败')
      }

      // 这里需要调用你的后端API来换取session
      // 或者使用Supabase的自定义认证
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'wechat', // 需要配置WeChat OAuth
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('微信登录失败:', error)
      throw error
    }
  }

  // 登出
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return true
    } catch (error) {
      console.error('登出失败:', error)
      throw error
    }
  }

  // 获取当前用户
  static async getCurrentUser() {
    try {
      const authData = await supabase.auth.getUser()
      
      if (authData.error) throw authData.error
      if (!authData.user) return null

      // 获取用户详细信息
      const userProfile = await UserService.getUserProfile(authData.user.id)
      
      return {
        ...authData.user,
        profile: userProfile
      }
    } catch (error) {
      console.error('获取当前用户失败:', error)
      return null
    }
  }

  // 重置密码
  static async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('重置密码失败:', error)
      throw error
    }
  }

  // 更新密码
  static async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('更新密码失败:', error)
      throw error
    }
  }

  // 更新用户资料
  static async updateProfile(updates) {
    try {
      const user = await this.getCurrentUser()
      if (!user) throw new Error('用户未登录')

      // 更新认证用户信息
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          nickname: updates.nickname
        }
      })

      if (authError) throw authError

      // 更新用户档案
      const updatedProfile = await UserService.updateUserProfile(user.id, updates)
      
      return updatedProfile
    } catch (error) {
      console.error('更新用户资料失败:', error)
      throw error
    }
  }

  // 监听认证状态变化
  static onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }

  // 检查邮箱是否已验证
  static async isEmailVerified() {
    try {
      const user = await this.getCurrentUser()
      return user?.email_confirmed_at ? true : false
    } catch (error) {
      console.error('检查邮箱验证状态失败:', error)
      return false
    }
  }

  // 重新发送验证邮件
  static async resendVerificationEmail() {
    try {
      const user = await this.getCurrentUser()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user?.email || ''
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('重新发送验证邮件失败:', error)
      throw error
    }
  }
}

// 认证相关的工具函数
export const getAuthErrorMessage = (error) => {
  if (typeof error === 'string') return error
  
  const message = error?.message || error?.error_description || '未知错误'
  
  // 常见错误信息映射
  const errorMap = {
    'Invalid login credentials': '邮箱或密码错误',
    'Email not confirmed': '请先验证邮箱',
    'User already registered': '该邮箱已被注册',
    'Password should be at least 6 characters': '密码至少需要6位字符',
    'Invalid email': '邮箱格式不正确',
    'Network request failed': '网络连接失败，请检查网络',
    'Too many requests': '请求过于频繁，请稍后再试'
  }
  
  return errorMap[message] || message
}

// 检查用户权限的工具函数
export const hasPermission = async (eventId, requiredRole) => {
  try {
    const user = await AuthService.getCurrentUser()
    if (!user) return false

    const { data, error } = await supabase
      .from('event_members')
      .select('role')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single()

    if (error || !data) return false

    const roleHierarchy = {
      'viewer': 0,
      'member': 1,
      'admin': 2,
      'owner': 3
    }

    return roleHierarchy[data.role] >= roleHierarchy[requiredRole]
  } catch (error) {
    console.error('检查权限失败:', error)
    return false
  }
}

export default AuthService
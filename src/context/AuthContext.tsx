import { createContext, useContext, useEffect, ReactNode } from 'react'
import Taro from '@tarojs/taro'
import { useStore } from '../store/useStore'

interface AuthContextType {
  user: any
  loading: boolean
  isAuthenticated: boolean
  requireAuth: () => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { 
    user, 
    loading: authLoading,
    loadUser, 
    signOut,
    setupRealtime
  } = useStore()

  // 初始化认证状态
  useEffect(() => {
    const initAuth = async () => {
      try {
        await loadUser()
      } catch (error) {
        console.error('初始化认证失败:', error)
      }
    }

    initAuth()
  }, [])

  // 设置实时同步
  useEffect(() => {
    if (user) {
      const cleanup = setupRealtime()
      return cleanup
    }
  }, [user])

  const requireAuth = async (): Promise<boolean> => {
    try {
      // 如果没有用户信息，尝试重新加载
      if (!user) {
        await loadUser()
      }
      
      // 如果仍然没有用户信息，重定向到登录页
      if (!useStore.getState().user) {
        Taro.redirectTo({
          url: '/pages/login/index'
        })
        return false
      }
      
      return true
    } catch (error) {
      console.error('认证检查失败:', error)
      Taro.redirectTo({
        url: '/pages/login/index'
      })
      return false
    }
  }

  const logout = async () => {
    try {
      await signOut()
      Taro.redirectTo({
        url: '/pages/login/index'
      })
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  const value: AuthContextType = {
    user,
    loading: authLoading,
    isAuthenticated: !!user,
    requireAuth,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// HOC for protecting pages
export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const AuthWrappedComponent = (props: P) => {
    const { requireAuth, loading } = useAuth()

    useEffect(() => {
      if (!loading) {
        requireAuth()
      }
    }, [loading])

    if (loading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          加载中...
        </div>
      )
    }

    return <WrappedComponent {...props} />
  }

  AuthWrappedComponent.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`

  return AuthWrappedComponent
}
import { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import { useStore } from '../store/useStore'
import { useAuth } from '../context/AuthContext'

const AuthTest = () => {
  const [testResults, setTestResults] = useState<string[]>([])
  const { 
    user, 
    loading,
    signIn, 
    signUp,
    signOut,
    loadEvents 
  } = useStore()
  
  const { isAuthenticated } = useAuth()

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testSignIn = async () => {
    addResult('开始测试登录...')
    try {
      const result = await signIn('test@example.com', 'password123')
      addResult(`登录成功: ${JSON.stringify(result)}`)
    } catch (error) {
      addResult(`登录失败: ${error.message}`)
    }
  }

  const testSignUp = async () => {
    addResult('开始测试注册...')
    try {
      const result = await signUp('new@example.com', 'password123', '测试用户')
      addResult(`注册成功: ${JSON.stringify(result)}`)
    } catch (error) {
      addResult(`注册失败: ${error.message}`)
    }
  }

  const testLoadEvents = async () => {
    addResult('开始测试加载事件...')
    try {
      const result = await loadEvents()
      addResult(`加载事件成功: ${result?.length || 0} 个事件`)
    } catch (error) {
      addResult(`加载事件失败: ${error.message}`)
    }
  }

  const testSignOut = async () => {
    addResult('开始测试登出...')
    try {
      const result = await signOut()
      addResult(`登出成功: ${result}`)
    } catch (error) {
      addResult(`登出失败: ${error.message}`)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <View style={{ padding: '20px' }}>
      <Text style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
        认证功能测试
      </Text>
      
      <View style={{ marginBottom: '20px' }}>
        <Text>当前用户: {user ? user.email : '未登录'}</Text>
        <Text>认证状态: {isAuthenticated ? '已认证' : '未认证'}</Text>
        <Text>加载状态: {loading ? '加载中' : '已完成'}</Text>
      </View>

      <View style={{ marginBottom: '20px' }}>
        <Button 
          onClick={testSignIn}
          style={{ marginBottom: '10px' }}
        >
          测试登录
        </Button>
        <Button 
          onClick={testSignUp}
          style={{ marginBottom: '10px' }}
        >
          测试注册
        </Button>
        <Button 
          onClick={testLoadEvents}
          style={{ marginBottom: '10px' }}
        >
          测试加载事件
        </Button>
        <Button 
          onClick={testSignOut}
          style={{ marginBottom: '10px' }}
        >
          测试登出
        </Button>
        <Button 
          onClick={clearResults}
        >
          清除结果
        </Button>
      </View>

      <View style={{ 
        background: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '8px',
        maxHeight: '300px',
        overflow: 'auto'
      }}>
        <Text style={{ fontWeight: 'bold', marginBottom: '10px' }}>
          测试结果:
        </Text>
        {testResults.map((result, index) => (
          <Text key={index} style={{ 
            fontSize: '12px', 
            color: '#666',
            marginBottom: '5px',
            fontFamily: 'monospace'
          }}>
            {result}
          </Text>
        ))}
      </View>
    </View>
  )
}

export default AuthTest
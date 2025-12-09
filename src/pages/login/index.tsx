import { useState, useEffect } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { 
  AtCard,
  AtForm,
  AtInput,
  AtButton,
  AtIcon,
  AtToast,
  AtDivider,
  AtCheckbox,
  AtCheckboxOption
} from 'taro-ui'
import { useStore } from '../../store/useStore'
import './index.scss'

interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

const Login = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  })
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastText, setToastText] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error' | 'loading'>('loading')
  const [isSignUp, setIsSignUp] = useState(false)
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: ''
  })

  const { 
    user, 
    loading: authLoading,
    signIn, 
    signUp,
    setCurrentEvent,
    loadEvents
  } = useStore()

  // 如果用户已登录，重定向到首页
  useEffect(() => {
    if (user) {
      Taro.redirectTo({
        url: '/pages/index/index'
      })
    }
  }, [user])

  // 自动加载保存的邮箱
  useEffect(() => {
    const savedEmail = Taro.getStorageSync('saved_email')
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail, rememberMe: true }))
    }
  }, [])

  const showToastMessage = (message: string, type: 'success' | 'error' | 'loading' = 'error') => {
    setToastText(message)
    setToastType(type)
    setShowToast(true)
    
    if (type !== 'loading') {
      setTimeout(() => setShowToast(false), 2000)
    }
  }

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      showToastMessage('请填写邮箱和密码', 'error')
      return
    }

    setLoading(true)
    showToastMessage('登录中...', 'loading')

    try {
      await signIn(formData.email, formData.password)
      
      // 保存邮箱（如果勾选记住我）
      if (formData.rememberMe) {
        Taro.setStorageSync('saved_email', formData.email)
      } else {
        Taro.removeStorageSync('saved_email')
      }

      showToastMessage('登录成功', 'success')
      
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        Taro.redirectTo({
          url: '/pages/index/index'
        })
      }, 1000)
      
    } catch (error) {
      console.error('登录失败:', error)
      const errorMessage = getErrorMessage(error)
      showToastMessage(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    if (!signUpData.email || !signUpData.password || !signUpData.nickname) {
      showToastMessage('请填写所有必填字段', 'error')
      return
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      showToastMessage('两次输入的密码不一致', 'error')
      return
    }

    if (signUpData.password.length < 6) {
      showToastMessage('密码至少需要6位字符', 'error')
      return
    }

    setLoading(true)
    showToastMessage('注册中...', 'loading')

    try {
      await signUp(signUpData.email, signUpData.password, signUpData.nickname)
      showToastMessage('注册成功，请查收验证邮件', 'success')
      
      // 切换到登录页面
      setTimeout(() => {
        setIsSignUp(false)
        setFormData(prev => ({ ...prev, email: signUpData.email }))
      }, 2000)
      
    } catch (error) {
      console.error('注册失败:', error)
      const errorMessage = getErrorMessage(error)
      showToastMessage(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const getErrorMessage = (error: any): string => {
    const message = error?.message || error?.error_description || '未知错误'
    
    const errorMap: { [key: string]: string } = {
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

  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSignUpChange = (field: keyof typeof signUpData, value: string) => {
    setSignUpData(prev => ({ ...prev, [field]: value }))
  }

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp)
    setToastText('')
    setShowToast(false)
  }

  if (authLoading) {
    return (
      <View className='login'>
        <View className='loading'>
          <AtIcon value='loading-3' size='32' color='#1890ff' />
          <Text className='loading-text'>加载中...</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='login'>
      <View className='login-container'>
        {/* Logo 和标题 */}
        <View className='header'>
          <View className='logo'>
            <AtIcon value='bookmark' size='48' color='#1890ff' />
          </View>
          <Text className='app-title'>婚礼策划助手</Text>
          <Text className='app-subtitle'>
            {isSignUp ? '创建新账户' : '欢迎回来'}
          </Text>
        </View>

        {/* 登录表单 */}
        {!isSignUp ? (
          <AtCard className='login-card'>
            <AtForm>
              <AtInput
                name='email'
                title='邮箱'
                type='text'
                placeholder='请输入邮箱'
                value={formData.email}
                onChange={(value) => handleInputChange('email', value)}
                clear
                maxLength={50}
              />
              
              <AtInput
                name='password'
                title='密码'
                type='password'
                placeholder='请输入密码'
                value={formData.password}
                onChange={(value) => handleInputChange('password', value)}
                clear
                maxLength={20}
              />

              <View className='remember-me'>
                <AtCheckbox
                  options={[{
                    value: 'remember',
                    label: '记住我'
                  }]}
                  selectedList={formData.rememberMe ? ['remember'] : []}
                  onChange={(value) => handleInputChange('rememberMe', value.includes('remember'))}
                />
              </View>

              <AtButton 
                type='primary' 
                className='login-btn'
                loading={loading}
                disabled={loading}
                onClick={handleLogin}
              >
                {loading ? '登录中...' : '登录'}
              </AtButton>
            </AtForm>

            <AtDivider content='或' />

            <View className='switch-mode'>
              <Text className='switch-text'>还没有账户？</Text>
              <Text 
                className='switch-link' 
                onClick={toggleSignUp}
              >
                立即注册
              </Text>
            </View>
          </AtCard>
        ) : (
          /* 注册表单 */
          <AtCard className='signup-card'>
            <AtForm>
              <AtInput
                name='nickname'
                title='昵称'
                type='text'
                placeholder='请输入昵称'
                value={signUpData.nickname}
                onChange={(value) => handleSignUpChange('nickname', value)}
                clear
                maxLength={20}
              />
              
              <AtInput
                name='email'
                title='邮箱'
                type='text'
                placeholder='请输入邮箱'
                value={signUpData.email}
                onChange={(value) => handleSignUpChange('email', value)}
                clear
                maxLength={50}
              />
              
              <AtInput
                name='password'
                title='密码'
                type='password'
                placeholder='请输入密码（至少6位）'
                value={signUpData.password}
                onChange={(value) => handleSignUpChange('password', value)}
                clear
                maxLength={20}
              />
              
              <AtInput
                name='confirmPassword'
                title='确认密码'
                type='password'
                placeholder='请再次输入密码'
                value={signUpData.confirmPassword}
                onChange={(value) => handleSignUpChange('confirmPassword', value)}
                clear
                maxLength={20}
              />

              <AtButton 
                type='primary' 
                className='signup-btn'
                loading={loading}
                disabled={loading}
                onClick={handleSignUp}
              >
                {loading ? '注册中...' : '注册'}
              </AtButton>
            </AtForm>

            <AtDivider content='或' />

            <View className='switch-mode'>
              <Text className='switch-text'>已有账户？</Text>
              <Text 
                className='switch-link' 
                onClick={toggleSignUp}
              >
                立即登录
              </Text>
            </View>
          </AtCard>
        )}

        {/* 其他登录方式 */}
        <View className='other-login'>
          <Text className='other-title'>其他登录方式</Text>
          <View className='other-buttons'>
            <AtButton 
              className='wechat-btn'
              onClick={() => showToastMessage('微信登录开发中', 'error')}
            >
              <AtIcon value='wechat' size='20' color='#07c160' />
              <Text>微信登录</Text>
            </AtButton>
          </View>
        </View>

        {/* 底部信息 */}
        <View className='footer'>
          <Text className='footer-text'>登录即表示同意</Text>
          <Text className='footer-link'>用户协议</Text>
          <Text className='footer-text'>和</Text>
          <Text className='footer-link'>隐私政策</Text>
        </View>
      </View>

      {/* Toast 提示 */}
      <AtToast 
        isOpened={showToast}
        text={toastText}
        status={toastType}
        duration={2000}
        hasMask={false}
      />
    </View>
  )
}

export default Login
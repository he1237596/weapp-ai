import { useEffect } from 'react'
import 'taro-ui/dist/style/index.scss'
import './app.scss'

// 引入 Taro UI
import Taro from '@tarojs/taro'
import { useStore } from './store/useStore'

const App = (props: { children?: React.ReactNode }) => {
  const { loadUser, setupRealtime } = useStore()

  useEffect(() => {
    // 初始化 Taro
    Taro.initPxTransform({
      designWidth: 750
    })

    // 尝试加载当前用户
    const initializeApp = async () => {
      try {
        await loadUser()
        
        // 如果用户已登录，设置实时同步
        const { user } = useStore.getState()
        if (user) {
          setupRealtime()
        }
      } catch (error) {
        console.error('应用初始化失败:', error)
      }
    }

    initializeApp()
  }, [])

  useEffect(() => {
    // 监听应用显示/隐藏
    const handleShow = () => {
      console.log('应用显示')
      // 可以在这里检查网络状态、刷新数据等
    }

    const handleHide = () => {
      console.log('应用隐藏')
      // 可以在这里保存数据、暂停实时连接等
    }

    Taro.onAppShow(handleShow)
    Taro.onAppHide(handleHide)

    return () => {
      Taro.offAppShow(handleShow)
      Taro.offAppHide(handleHide)
    }
  }, [])

  return (
    <>
      {props.children}
    </>
  )
}

export default App
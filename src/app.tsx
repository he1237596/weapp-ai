import { useEffect } from 'react'
import { Provider } from 'react-redux'
import store from './store'
import 'taro-ui/dist/style/index.scss'
import './app.scss'

// 引入 Taro UI
import Taro from '@tarojs/taro'

const App = (props: { children?: React.ReactNode }) => {
  useEffect(() => {
    Taro.initPxTransform({
      designWidth: 750
    })
  }, [])

  return (
    <Provider store={store}>
      {props.children}
    </Provider>
  )
}

export default App
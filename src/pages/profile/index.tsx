import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { 
  AtCard,
  AtList,
  AtListItem,
  AtAvatar,
  AtIcon,
  AtButton,
  AtBadge,
  AtDivider,
  AtSwitch,
  AtTag
} from 'taro-ui'
import './index.scss'

interface UserInfo {
  name: string
  avatar: string
  phone: string
  email: string
}

const Profile = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '婚礼策划用户',
    avatar: '👰',
    phone: '138****8888',
    email: 'user@example.com'
  })
  const [eventCount] = useState(5)
  const [taskCount] = useState(23)
  const [totalBudget] = useState(156000)
  const [totalExpense] = useState(45000)
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    loadUserInfo()
  }, [])

  const loadUserInfo = () => {
    // 加载用户信息和统计数据
    const storedUser = Taro.getStorageSync('user')
    if (storedUser) {
      setUserInfo(storedUser)
    }
  }

  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 清除用户信息
          Taro.removeStorageSync('user')
          Taro.showToast({
            title: '已退出',
            icon: 'success'
          })
        }
      }
    })
  }

  const handleMenuClick = (type: string) => {
    const actionMap: { [key: string]: () => void } = {
      settings: () => {
        Taro.showToast({
          title: '设置页面开发中',
          icon: 'none'
        })
      },
      backup: () => {
        Taro.showToast({
          title: '数据备份功能开发中',
          icon: 'none'
        })
      },
      about: () => {
        Taro.showModal({
          title: '关于我们',
          content: '婚礼策划助手 v1.0.0\n一款专业的事件管理和预算控制应用',
          showCancel: false
        })
      },
      help: () => {
        Taro.showToast({
          title: '帮助页面开发中',
          icon: 'none'
        })
      },
      feedback: () => {
        Taro.showToast({
          title: '反馈功能开发中',
          icon: 'none'
        })
      }
    }

    if (actionMap[type]) {
      actionMap[type]()
    }
  }

  const handleNotificationChange = (value: boolean) => {
    setNotifications(value)
    Taro.showToast({
      title: value ? '已开启通知' : '已关闭通知',
      icon: 'success'
    })
  }

  const handleDarkModeChange = (value: boolean) => {
    setDarkMode(value)
    Taro.showToast({
      title: value ? '已开启深色模式' : '已关闭深色模式',
      icon: 'success'
    })
  }

  const statsData = [
    {
      icon: 'bookmark',
      text: '我的事件',
      value: eventCount.toString(),
      iconColor: '#1890ff'
    },
    {
      icon: 'list',
      text: '任务总数',
      value: taskCount.toString(),
      iconColor: '#52c41a'
    },
    {
      icon: 'tag',
      text: '总预算',
      value: `¥${totalBudget}`,
      iconColor: '#fa8c16'
    },
    {
      icon: 'credit-card',
      text: '已支出',
      value: `¥${totalExpense}`,
      iconColor: '#ff4d4f'
    }
  ]

  return (
    <View className='profile'>
      {/* 用户信息卡片 */}
      <AtCard className='user-card'>
        <View className='user-header'>
          <AtAvatar 
            circle 
            size='large'
            text={userInfo.avatar}
            className='user-avatar'
          />
          <View className='user-info'>
            <Text className='user-name'>{userInfo.name}</Text>
            <Text className='user-phone'>{userInfo.phone}</Text>
            <Text className='user-email'>{userInfo.email}</Text>
          </View>
          <AtBadge value='VIP' maxValue={99} dot={false}>
            <AtTag type='primary' size='small' circle>
              会员
            </AtTag>
          </AtBadge>
        </View>
      </AtCard>

      {/* 统计数据 */}
      <AtCard title='数据统计' note='个人使用数据一览'>
        <View className='stats-grid'>
          {statsData.map((item, index) => (
            <View key={index} className='grid-item'>
              <AtIcon value={item.icon} size='20' color={item.iconColor} />
              <Text className='grid-text'>{item.text}</Text>
              <Text className='grid-value'>{item.value}</Text>
            </View>
          ))}
        </View>
      </AtCard>

      {/* 功能菜单 */}
      <AtCard title='功能设置' note='应用相关设置'>
        <AtList>
          <AtListItem 
            title='通知提醒'
            iconInfo={{ value: 'bell', size: 16, color: '#1890ff' }}
            extraText={
              <AtSwitch 
                checked={notifications}
                onChange={handleNotificationChange}
              />
            }
          />
          <AtListItem 
            title='深色模式'
            iconInfo={{ value: 'clock', size: 16, color: '#fa8c16' }}
            extraText={
              <AtSwitch 
                checked={darkMode}
                onChange={handleDarkModeChange}
              />
            }
          />
          <AtDivider />
          <AtListItem 
            title='个人设置'
            iconInfo={{ value: 'settings', size: 16, color: '#52c41a' }}
            arrow='right'
            onClick={() => handleMenuClick('settings')}
          />
          <AtListItem 
            title='数据备份'
            iconInfo={{ value: 'download', size: 16, color: '#fa8c16' }}
            arrow='right'
            onClick={() => handleMenuClick('backup')}
          />
          <AtListItem 
            title='帮助反馈'
            iconInfo={{ value: 'help', size: 16, color: '#1890ff' }}
            arrow='right'
            onClick={() => handleMenuClick('feedback')}
          />
        </AtList>
      </AtCard>

      {/* 关于应用 */}
      <AtCard title='关于应用' note='版本信息与帮助'>
        <AtList>
          <AtListItem 
            title='版本信息'
            note='v1.0.0'
            iconInfo={{ value: 'info', size: 16, color: '#722ed1' }}
          />
          <AtListItem 
            title='关于我们'
            iconInfo={{ value: 'customerservice', size: 16, color: '#13c2c2' }}
            arrow='right'
            onClick={() => handleMenuClick('about')}
          />
        </AtList>
      </AtCard>

      {/* 退出登录 */}
      <View className='logout-section'>
        <AtButton 
          type='primary' 
          size='normal'
          onClick={handleLogout}
          className='logout-btn'
        >
          <AtIcon value='bookmark' size='16' color='#fff' />
          <Text>退出登录</Text>
        </AtButton>
      </View>
    </View>
  )
}

export default Profile
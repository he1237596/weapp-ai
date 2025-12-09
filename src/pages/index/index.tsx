import { useState, useEffect } from 'react'
import { View, Text, Swiper, SwiperItem } from '@tarojs/components'
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro'
import { 
  AtCard, 
  AtButton, 
  AtSearchBar, 
  AtIcon, 
  AtFab, 
  AtTag,
  AtProgress,
  AtNoticebar,
  AtGrid,
  AtDivider,
  AtLoadMore,
  AtActivityIndicator
} from 'taro-ui'
import { useAuth } from '../../context/AuthContext'
import { useStore } from '../../store/useStore'
import { formatMoney, formatDate } from '../../utils/common'
import './index.scss'

const Index = () => {
  const { user, isAuthenticated, requireAuth } = useAuth()
  const { 
    events, 
    loading: eventsLoading,
    loadEvents,
    setCurrentEvent,
    createEvent,
    loadTasks,
    loadExpenses
  } = useStore()

  const [searchKeyword, setSearchKeyword] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [quickStats, setQuickStats] = useState({
    totalEvents: 0,
    totalBudget: 0,
    totalExpenses: 0,
    upcomingEvents: 0
  })

  // 加载首页数据
  const loadIndexData = async () => {
    if (!isAuthenticated) {
      return
    }

    try {
      await loadEvents()
      calculateQuickStats()
    } catch (error) {
      console.error('加载数据失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  }

  // 计算快速统计
  const calculateQuickStats = () => {
    const stats = {
      totalEvents: events.length,
      totalBudget: events.reduce((sum, event) => sum + (event.budget || 0), 0),
      totalExpenses: 0, // 这里可以后续实现支出统计
      upcomingEvents: events.filter(event => {
        const eventDate = new Date(event.start_date)
        const today = new Date()
        const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return daysUntil > 0 && daysUntil <= 30
      }).length
    }
    setQuickStats(stats)
  }

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchKeyword(value)
    // 这里可以实现搜索逻辑
  }

  // 处理下拉刷新
  usePullDownRefresh(async () => {
    setRefreshing(true)
    await loadIndexData()
    setRefreshing(false)
    Taro.stopPullDownRefresh()
  })

  // 页面显示时加载数据
  useDidShow(() => {
    requireAuth().then((authenticated) => {
      if (authenticated) {
        loadIndexData()
      }
    })
  })

  useEffect(() => {
    if (isAuthenticated) {
      loadIndexData()
    }
  }, [isAuthenticated])

  useEffect(() => {
    calculateQuickStats()
  }, [events])

  // 快速创建事件
  const handleQuickCreateEvent = async (eventType: string) => {
    try {
      const eventData = {
        title: getEventTitleByType(eventType),
        icon: getEventIconByType(eventType),
        start_date: new Date().toISOString().split('T')[0],
        budget: getDefaultBudgetByType(eventType),
        status: 'planning'
      }

      await createEvent(eventData)
      
      Taro.showToast({
        title: '创建成功',
        icon: 'success'
      })
      
      await loadEvents()
    } catch (error) {
      console.error('创建事件失败:', error)
      Taro.showToast({
        title: '创建失败',
        icon: 'error'
      })
    }
  }

  const getEventTitleByType = (type: string): string => {
    const titles: { [key: string]: string } = {
      wedding: '婚礼筹备',
      birthday: '生日派对',
      meeting: '商务会议',
      travel: '旅行计划'
    }
    return titles[type] || '新事件'
  }

  const getEventIconByType = (type: string): string => {
    const icons: { [key: string]: string } = {
      wedding: '💒',
      birthday: '🎂',
      meeting: '💼',
      travel: '✈️'
    }
    return icons[type] || '📅'
  }

  const getDefaultBudgetByType = (type: string): number => {
    const budgets: { [key: string]: number } = {
      wedding: 100000,
      birthday: 5000,
      meeting: 10000,
      travel: 20000
    }
    return budgets[type] || 10000
  }

  // 跳转到事件详情
  const handleEventClick = async (event: any) => {
    setCurrentEvent(event)
    
    // 加载事件相关的任务和支出
    try {
      await Promise.all([
        loadTasks(event.id),
        loadExpenses(event.id)
      ])
    } catch (error) {
      console.error('加载事件数据失败:', error)
    }
    
    Taro.navigateTo({
      url: `/pages/event/detail?id=${event.id}`
    })
  }

  // 快速操作按钮
  const quickActions = [
    {
      title: '婚礼筹备',
      icon: '💒',
      type: 'wedding',
      color: '#ff6b6b'
    },
    {
      title: '生日派对',
      icon: '🎂',
      type: 'birthday',
      color: '#4ecdc4'
    },
    {
      title: '商务会议',
      icon: '💼',
      type: 'meeting',
      color: '#45b7d1'
    },
    {
      title: '旅行计划',
      icon: '✈️',
      type: 'travel',
      color: '#96ceb4'
    }
  ]

  // 筛选后的事件列表
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchKeyword.toLowerCase())
  )

  if (!isAuthenticated) {
    return (
      <View className='index'>
        <View className='auth-required'>
          <AtIcon value='user' size='64' color='#ccc' />
          <Text className='auth-title'>请先登录</Text>
          <Text className='auth-desc'>登录后使用完整功能</Text>
          <AtButton 
            type='primary'
            onClick={() => Taro.navigateTo({ url: '/pages/login/index' })}
          >
            去登录
          </AtButton>
        </View>
      </View>
    )
  }

  if (eventsLoading && events.length === 0) {
    return (
      <View className='index'>
        <View className='loading'>
          <AtActivityIndicator mode='center' content='加载中...' />
        </View>
      </View>
    )
  }

  return (
    <View className='index'>
      {/* 欢迎横幅 */}
      <View className='welcome-banner'>
        <View className='welcome-content'>
          <Text className='welcome-text'>
            欢迎回来，{user?.nickname || '用户'}！
          </Text>
          <Text className='welcome-date'>
            {formatDate(new Date())}
          </Text>
        </View>
        <View className='weather-info'>
          <AtIcon value='cloud' size='32' color='#ffd93d' />
          <Text className='weather-text'>今日宜策划</Text>
        </View>
      </View>

      {/* 快速统计 */}
      <AtCard className='stats-card'>
        <View className='stats-grid'>
          <View className='stat-item'>
            <Text className='stat-number'>{quickStats.totalEvents}</Text>
            <Text className='stat-label'>总事件</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-number'>{quickStats.upcomingEvents}</Text>
            <Text className='stat-label'>即将到来</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-number'>¥{formatMoney(quickStats.totalBudget)}</Text>
            <Text className='stat-label'>总预算</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-number'>¥{formatMoney(quickStats.totalExpenses)}</Text>
            <Text className='stat-label'>总支出</Text>
          </View>
        </View>
      </AtCard>

      {/* 搜索栏 */}
      <View className='search-section'>
        <AtSearchBar
          value={searchKeyword}
          onChange={handleSearch}
          placeholder='搜索事件...'
        />
      </View>

      {/* 快速操作 */}
      {filteredEvents.length === 0 && (
        <AtCard title='快速创建' note='选择模板快速开始'>
          <AtGrid 
            data={quickActions}
            columnNum={2}
            hasBorder={false}
            onClick={(item) => handleQuickCreateEvent(item.type)}
          />
        </AtCard>
      )}

      {/* 事件列表 */}
      {filteredEvents.length > 0 && (
        <View className='events-section'>
          <View className='section-header'>
            <Text className='section-title'>我的事件</Text>
            <AtButton 
              size='small'
              type='primary'
              onClick={() => Taro.navigateTo({ url: '/pages/event/create' })}
            >
              <AtIcon value='add' size='14' color='#fff' />
              新建
            </AtButton>
          </View>
          
          <View className='events-list'>
            {filteredEvents.map((event) => (
              <AtCard 
                key={event.id}
                className='event-card'
                onClick={() => handleEventClick(event)}
              >
                <View className='event-content'>
                  <View className='event-header'>
                    <View className='event-info'>
                      <Text className='event-icon'>{event.icon}</Text>
                      <Text className='event-title'>{event.title}</Text>
                    </View>
                    <AtTag 
                      type='primary' 
                      size='small'
                    >
                      {getStatusText(event.status)}
                    </AtTag>
                  </View>
                  
                  <View className='event-details'>
                    <Text className='event-date'>
                      {formatDate(new Date(event.start_date))}
                    </Text>
                    <Text className='event-budget'>
                      预算: ¥{formatMoney(event.budget || 0)}
                    </Text>
                  </View>
                  
                  <View className='event-progress'>
                    <Text className='progress-text'>进度</Text>
                    <AtProgress 
                      percent={event.progress || 0} 
                      strokeWidth={4}
                      color='#1890ff'
                      status='progress'
                    />
                  </View>
                </View>
              </AtCard>
            ))}
          </View>
        </View>
      )}

      {/* 空状态 */}
      {filteredEvents.length === 0 && (
        <View className='empty-state'>
          <AtIcon value='bookmark' size='64' color='#ccc' />
          <Text className='empty-title'>
            {searchKeyword ? '没有找到相关事件' : '还没有事件'}
          </Text>
          <Text className='empty-desc'>
            {searchKeyword ? '尝试其他搜索关键词' : '创建你的第一个事件开始吧'}
          </Text>
          {!searchKeyword && (
            <AtButton 
              type='primary'
              onClick={() => Taro.navigateTo({ url: '/pages/event/create' })}
            >
              创建事件
            </AtButton>
          )}
        </View>
      )}

      {/* 悬浮按钮 */}
      <AtFab
        onClick={() => Taro.navigateTo({ url: '/pages/event/create' })}
      >
        <AtIcon value='add' size='24' color='#fff' />
      </AtFab>

      {/* 加载更多 */}
      {refreshing && (
        <AtLoadMore 
          moreText='正在刷新...'
          status='loading'
        />
      )}
    </View>
  )
}

// 获取状态文本
const getStatusText = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    planning: '计划中',
    ongoing: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

export default Index
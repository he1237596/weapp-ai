import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'

import { Task } from '../../types'
import { 
  AtTabs, 
  AtTabsPane, 
  AtCard, 
  AtList, 
  AtListItem,
  AtButton,
  AtIcon,
  AtTag,
  AtProgress,
  AtFab,
  AtSearchBar,
  AtBadge,
  AtTimeline,
  AtActivityIndicator
} from 'taro-ui'
import { formatMoney } from '../../utils/common'
import './tasks.scss'

const EventTasks = () => {
  const [eventId, setEventId] = useState(null)
  const [activeTab, setActiveTab] = useState('process') // process / calendar / expense
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const { id } = router.params
    setEventId(id)
  }, [router.params])

  useEffect(() => {
    if (eventId) {
      loadTasks()
    }
  }, [eventId])

  const loadTasks = async () => {
    try {
      if (!eventId) return

      // 临时使用模拟数据，避免 Headers 和 AbortController 兼容性问题
      // TODO: 在解决 Supabase 兼容性后替换为真实数据调用
      const mockTasks = [
        {
          id: '1',
          title: '婚纱拍摄',
          status: 'completed',
          cost: 2800,
          icon: '📸',
          description: '在厦门鼓浪屿拍摄婚纱照',
          priority: 'high',
          due_date: '2024-06-15'
        },
        {
          id: '2',
          title: '宴席酒店预订',
          status: 'doing',
          cost: 0,
          icon: '🏨',
          description: '预订婚宴酒店，确定菜单',
          priority: 'high',
          due_date: '2024-06-20'
        },
        {
          id: '3',
          title: '请柬设计',
          status: 'doing',
          cost: 500,
          icon: '💌',
          description: '设计并制作婚礼请柬',
          priority: 'medium',
          due_date: '2024-06-25'
        },
        {
          id: '4',
          title: '婚纱试穿',
          status: 'pending',
          cost: 0,
          icon: '👗',
          description: '婚纱和礼服试穿',
          priority: 'medium',
          due_date: '2024-07-01'
        },
        {
          id: '5',
          title: '婚礼化妆师',
          status: 'pending',
          cost: 800,
          icon: '💄',
          description: '预约婚礼化妆师',
          priority: 'low',
          due_date: '2024-07-05'
        }
      ]

      setTasks(mockTasks)
      setLoading(false)
    } catch (error) {
      console.error('加载任务失败:', error)
      setTasks([])
      setLoading(false)
    }
  }

  const getTaskIcon = (title) => {
    const iconMap = {
      '婚纱': '👗',
      '拍摄': '📸',
      '酒店': '🏨',
      '请柬': '💌',
      '化妆': '💄',
      '婚礼': '💒',
      '礼服': '🤵',
      '场地': '📍',
      '食物': '🍽️',
      '装饰': '🎊'
    }
    
    for (const [key, icon] of Object.entries(iconMap)) {
      if (title.includes(key)) return icon
    }
    return '📋'
  }

  const switchTab = (tab) => {
    setActiveTab(tab)
  }

  const navigateToTaskDetail = (taskId) => {
    Taro.navigateTo({
      url: `/pages/task/detail?taskId=${taskId}`
    })
  }

  const addTask = () => {
    Taro.navigateTo({
      url: `/pages/task/create?eventId=${eventId}`
    })
  }

  const getStatusText = (status) => {
    const statusMap = {
      'pending': '未开始',
      'doing': '进行中',
      'completed': '已完成'
    }
    return statusMap[status] || status
  }

  const getStatusClass = (status) => {
    const classMap = {
      'pending': 'pending',
      'doing': 'doing',
      'completed': 'completed'
    }
    return classMap[status] || ''
  }

  if (loading) {
    return (
      <View className='loading'>
        <AtActivityIndicator mode='center' content='加载中...' />
      </View>
    )
  }

  const tabList = [
    { title: '流程任务' },
    { title: '日程安排' },
    { title: '花费统计' }
  ]

  return (
    <View className='event-tasks'>
      {/* 玻璃态容器 */}
      <View className='glass-container'>
        {/* Tab栏 */}
        <AtTabs 
          current={activeTab === 'process' ? 0 : activeTab === 'calendar' ? 1 : 2}
          tabList={tabList}
          onClick={(value) => switchTab(value === 0 ? 'process' : value === 1 ? 'calendar' : 'expense')}
        >
          {/* 流程任务 */}
          <AtTabsPane current={0} index={0}>
            {tasks.length === 0 ? (
              <View className='empty-state'>
                <AtIcon value='file' size='60' color='#fff' />
                <Text className='empty-text'>暂无任务</Text>
                <AtButton 
                  type='primary' 
                  size='small'
                  onClick={addTask}
                >
                  创建第一个任务
                </AtButton>
              </View>
            ) : (
              <View className='task-list'>
              <AtTimeline
                items={tasks.map(task => ({
                  title: task.title,
                  content: [
                    `状态: ${getStatusText(task.status)}`,
                    task.description || '暂无描述',
                    `费用: ${task.cost > 0 ? `¥${formatMoney(task.cost)}` : '未录入'}`
                  ],
                  icon: task.icon,
                  color: task.status === 'completed' ? '#19be6b' : task.status === 'doing' ? '#ff9900' : '#ed4014'
                }))}
              />
              </View>
            )}
          </AtTabsPane>

          {/* 日程安排 */}
          <AtTabsPane current={1} index={1}>
            <View className='empty-state'>
              <AtIcon value='calendar' size='60' color='#fff' />
              <Text className='empty-text'>日程功能开发中...</Text>
              <AtButton type='primary' size='small'>
                即将推出
              </AtButton>
            </View>
          </AtTabsPane>

          {/* 花费统计 */}
          <AtTabsPane current={2} index={2}>
            <View className='empty-state'>
              <AtIcon value='money' size='60' color='#fff' />
              <Text className='empty-text'>花费统计功能开发中...</Text>
              <AtButton type='primary' size='small'>
                即将推出
              </AtButton>
            </View>
          </AtTabsPane>
        </AtTabs>
      </View>

      {/* 悬浮按钮 */}
      {activeTab === 'process' && (
        <AtFab onClick={addTask}>
          <AtIcon value='add' size='20' color='#fff' />
        </AtFab>
      )}
    </View>
  )
}

export default EventTasks
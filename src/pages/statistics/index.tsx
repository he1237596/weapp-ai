import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAuth } from '../../context/AuthContext'
import { useStore } from '../../store/useStore'
import { apiService } from '../../services/api'
import { getExpenseCategoryLabel, formatMoney } from '../../utils/common'
import { 
  AtCard,
  AtProgress,
  AtIcon,
  AtList,
  AtListItem,
  AtTag,
  AtTabs,
  AtLoadMore,
  AtActivityIndicator
} from 'taro-ui'
import './index.scss'

interface CategoryStats {
  category: string
  amount: number
  percentage: number
}

interface MonthlyStats {
  month: string
  amount: number
}

interface StatsData {
  totalBudget: number
  totalExpense: number
  categoryStats: CategoryStats[]
  monthlyStats: MonthlyStats[]
}

const Statistics = () => {
  const { requireAuth } = useAuth()
  const { 
    events, 
    expenses,
    loading: storeLoading
  } = useStore()

  const [loading, setLoading] = useState(true)
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [stats, setStats] = useState<StatsData>({
    totalBudget: 0,
    totalExpense: 0,
    categoryStats: [],
    monthlyStats: []
  })

  useEffect(() => {
    requireAuth().then((authenticated) => {
      if (authenticated) {
        loadStatisticsData()
      }
    })
  }, [])

  useEffect(() => {
    if (events.length > 0) {
      if (!selectedEventId && events.length > 0) {
        setSelectedEventId(events[0].id)
      }
      calculateStatistics()
    }
  }, [events, expenses, selectedEventId])

  const loadStatisticsData = async () => {
    try {
      setLoading(true)
      
      // 加载所有事件的支出数据
      const expensePromises = events.map(event => 
        apiService.loadExpenses(event.id).catch(error => {
          console.error(`加载事件 ${event.id} 支出失败:`, error)
          return null
        })
      )
      
      await Promise.all(expensePromises.filter(Boolean))
      
      setLoading(false)
    } catch (error) {
      console.error('加载统计数据失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'error'
      })
      setLoading(false)
    }
  }

  const calculateStatistics = () => {
    if (!selectedEventId) return

    const selectedEvent = events.find(event => event.id === selectedEventId)
    if (!selectedEvent) return

    // 筛选选中事件的支出
    const eventExpenses = expenses.filter(expense => 
      expense.eventId === selectedEventId
    )

    // 计算总支出和分类统计
    const totalExpense = eventExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    
    // 按分类统计
    const categoryMap: { [key: string]: number } = {}
    eventExpenses.forEach(expense => {
      if (!categoryMap[expense.category]) {
        categoryMap[expense.category] = 0
      }
      categoryMap[expense.category] += expense.amount
    })

    const categoryStats: CategoryStats[] = Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100 * 10) / 10 : 0
    })).sort((a, b) => b.amount - a.amount)

    // 按月统计
    const monthlyMap: { [key: string]: number } = {}
    eventExpenses.forEach(expense => {
      const month = expense.date ? expense.date.substring(0, 7) : 'unknown'
      if (!monthlyMap[month]) {
        monthlyMap[month] = 0
      }
      monthlyMap[month] += expense.amount
    })

    const monthlyStats: MonthlyStats[] = Object.entries(monthlyMap)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month))

    setStats({
      totalBudget: selectedEvent.budget || 0,
      totalExpense,
      categoryStats,
      monthlyStats
    })
  }

  if (loading || storeLoading) {
    return (
      <View className='statistics'>
        <AtActivityIndicator mode='center' content='加载中...' />
      </View>
    )
  }

  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <View className='statistics'>
        <View className='auth-required'>
          <AtIcon value='lock' size='64' color='#ccc' />
          <Text className='auth-title'>请先登录</Text>
          <Text className='auth-desc'>登录后查看统计数据</Text>
        </View>
      </View>
    )
  }

  if (events.length === 0) {
    return (
      <View className='statistics'>
        <View className='empty-state'>
          <AtIcon value='bar-chart' size='64' color='#ccc' />
          <Text className='empty-title'>暂无数据</Text>
          <Text className='empty-desc'>创建事件后查看统计</Text>
        </View>
      </View>
    )
  }

  const selectedEvent = events.find(event => event.id === selectedEventId)

  return (
    <View className='statistics'>
      <View className='header'>
        <Text className='title'>
          {selectedEvent ? `${selectedEvent.title} - 统计` : '统计概览'}
        </Text>
      </View>

      {/* 事件选择器 */}
      {events.length > 1 && (
        <View className='event-selector'>
          <AtTabs
            current={events.findIndex(event => event.id === selectedEventId)}
            tabList={events.map(event => ({
              title: event.title,
              id: event.id
            }))}
            onClick={(value) => setSelectedEventId(events[value].id)}
          />
        </View>
      )}

      <ScrollView className='content' scrollY>
        {/* 概览卡片 */}
        <AtCard title='概览' note='财务数据一览'>
          <View className='stats-overview'>
            <View className='stats-grid'>
              <View className='grid-item'>
                <AtIcon value='bookmark' size='24' color='#2d8cf0' />
                <Text className='grid-text'>总预算</Text>
                <Text className='grid-value'>¥{formatMoney(stats.totalBudget)}</Text>
              </View>
              <View className='grid-item'>
                <AtIcon value='tag' size='24' color='#ff6b6b' />
                <Text className='grid-text'>已支出</Text>
                <Text className='grid-value'>¥{formatMoney(stats.totalExpense)}</Text>
              </View>
              <View className='grid-item'>
                <AtIcon value='credit-card' size='24' color='#52c41a' />
                <Text className='grid-text'>剩余</Text>
                <Text className='grid-value'>¥{formatMoney(stats.totalBudget - stats.totalExpense)}</Text>
              </View>
              <View className='grid-item'>
                <AtIcon value='pie-chart' size='24' color='#fa8c16' />
                <Text className='grid-text'>使用率</Text>
                <Text className='grid-value'>
                  {stats.totalBudget > 0 
                    ? Math.round((stats.totalExpense / stats.totalBudget) * 100) 
                    : 0}%
                </Text>
              </View>
            </View>
          </View>
        </AtCard>

        {/* 分类统计 */}
        <AtCard title='分类统计' note='各类别支出分布'>
          <AtList>
            {stats.categoryStats.map((item, index) => (
                <AtListItem 
                key={index}
                title={getExpenseCategoryLabel(item.category)}
                extraText={`¥${formatMoney(item.amount)}`}
                arrow='right'
                iconInfo={{
                  value: 'tag',
                  color: '#ff9800',
                  size: 16
                }}
              >
                <AtProgress 
                  percent={item.percentage} 
                  strokeWidth={6}
                  color='#ff9800'
                  status='progress'
                />
                <Text className='percentage'>{item.percentage}%</Text>
              </AtListItem>
            ))}
          </AtList>
        </AtCard>

        {/* 月度趋势 */}
        <AtCard title='月度趋势' note='支出变化趋势'>
          <View className='monthly-trend'>
            {stats.monthlyStats.map((item, index) => (
              <View key={index} className='monthly-item'>
                <AtTag 
                  type='primary' 
                  size='small'
                  circle
                >
                  {item.month}
                </AtTag>
                <Text className='monthly-amount'>¥{formatMoney(item.amount)}</Text>
              </View>
            ))}
          </View>
        </AtCard>

        <AtLoadMore 
          moreText='没有更多数据了'
          status='noMore'
        />
      </ScrollView>
    </View>
  )
}

export default Statistics
import { useState, useEffect } from 'react'
import { View, Text, Button, Progress } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { ExpenseService, EventService } from '../../services/database'
import { formatMoney, calculatePercentage } from '../../utils/common'
import './expenses.scss'

interface Expense {
  id: string
  category: string
  amount: number
  label: string
  date: string
  description?: string
}

interface CategoryData {
  category: string
  amount: number
  percentage: number
  label: string
}

const EventExpenses = () => {
  const router = useRouter()
  const { id } = router.params
  
  const [eventId, setEventId] = useState<string | null>(id || null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budget, setBudget] = useState(56000)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadExpenses()
  }, [eventId])

  const loadExpenses = async () => {
    try {
      if (!eventId) return

      // 获取事件信息
      const event = await EventService.getEventDetail(eventId)
      
      // 获取支出数据
      const expensesData = await ExpenseService.getEventExpenses(eventId)
      
      setExpenses(expensesData.map(expense => ({
        id: expense.id,
        category: expense.category,
        amount: expense.amount,
        label: expense.title,
        date: expense.created_at.split('T')[0],
        description: expense.description
      })))
      setBudget(event.budget)
      setLoading(false)
    } catch (error) {
      console.error('加载支出数据失败:', error)
      // 使用模拟数据作为备用
      const mockExpenses = [
        { id: '1', category: 'hotel', amount: 5000, label: '酒店订金', date: '2025-02-15' },
        { id: '2', category: 'clothing', amount: 3200, label: '婚纱定制', date: '2025-02-20' },
        { id: '3', category: 'photography', amount: 2800, label: '拍婚纱照', date: '2025-02-25' },
        { id: '4', category: 'catering', amount: 1000, label: '试菜费用', date: '2025-03-01' }
      ]

      setExpenses(mockExpenses)
      setLoading(false)
    }
  }

  const addExpense = () => {
    Taro.navigateTo({
      url: `/pages/expense/create?eventId=${eventId}`
    })
  }

  const getCategoryData = (): CategoryData[] => {
    const categoryTotals: Record<string, number> = {}
    
    expenses.forEach(expense => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0
      }
      categoryTotals[expense.category] += expense.amount
    })

    const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0)
    
    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      percentage: calculatePercentage(amount, total),
      label: getCategoryLabel(category)
    }))
  }

  const getCategoryLabel = (category: string): string => {
    const categoryMap = {
      'hotel': '酒店',
      'clothing': '服装',
      'photography': '摄影',
      'catering': '餐饮',
      'decoration': '装饰',
      'transportation': '交通',
      'gift': '礼品',
      'other': '其他'
    }
    return categoryMap[category as keyof typeof categoryMap] || '其他'
  }

  if (loading) {
    return (
      <View className='loading'>
        <Text>加载中...</Text>
      </View>
    )
  }

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const remainingBudget = budget - totalSpent
  const spentPercentage = calculatePercentage(totalSpent, budget)
  const categoryData = getCategoryData()

  return (
    <View className='event-expenses'>
      {/* 预算进度条 */}
      <View className='budget-progress'>
        <Text className='progress-title'>预算进度条</Text>
        <View className='progress-bar'>
          <Progress
            percent={spentPercentage}
            strokeWidth={8}
            activeColor={spentPercentage > 80 ? '#ff2442' : '#ff9500'}
            backgroundColor='#f0f0f0'
          />
        </View>
        <View className='progress-text'>
          <Text className='spent'>已花费 ¥{formatMoney(totalSpent)}</Text>
          <Text className='separator'>/</Text>
          <Text className='total'>预算 ¥{formatMoney(budget)}</Text>
        </View>
      </View>

      {/* 支出分类饼图（中保真文字版） */}
      <View className='chart-section'>
        <Text className='section-title'>支出分类</Text>
        <View className='pie-chart-text'>
          {categoryData.map((item, index) => (
            <Text key={item.category} className='category-item'>
              {item.label} {item.percentage}% {index < categoryData.length - 1 ? '|' : ''}
            </Text>
          ))}
        </View>
      </View>

      {/* 明细列表 */}
      <View className='expense-list-section'>
        <Text className='section-title'>明细列表</Text>
        <View className='expense-list'>
          {expenses.map(expense => (
            <View key={expense.id} className='expense-item'>
              <Text className='expense-label'>{expense.label}</Text>
              <Text className='expense-amount'>¥{formatMoney(expense.amount)}</Text>
            </View>
          ))}
          
          {expenses.length === 0 && (
            <View className='empty-state'>
              <Text className='empty-text'>还没有支出记录</Text>
              <Button className='add-first-btn' onClick={addExpense}>
                添加第一笔支出
              </Button>
            </View>
          )}
        </View>
      </View>

      {/* 悬浮按钮 */}
      {expenses.length > 0 && (
        <View className='fab' onClick={addExpense}>
          <Text className='fab-text'>＋</Text>
        </View>
      )}
    </View>
  )
}

export default EventExpenses
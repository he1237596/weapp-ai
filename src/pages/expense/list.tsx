import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { 
  AtCard, 
  AtButton, 
  AtIcon,
  AtTag,
  AtFab,
  AtSearchBar,
  AtList,
  AtListItem
} from 'taro-ui'
import { getExpenseCategoryLabel, formatMoney } from '../../utils/common'
import './list.scss'

interface Expense {
  id: string
  title: string
  amount: number
  category: string
  date: string
  description: string
  paymentMethod: string
}

const ExpenseList = () => {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [searchValue, setSearchValue] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = () => {
    const mockExpenses: Expense[] = [
      {
        id: '1',
        title: '婚礼化妆',
        amount: 3000,
        category: 'decoration',
        date: '2024-03-25',
        description: '婚礼当天化妆造型',
        paymentMethod: 'cash'
      },
      {
        id: '2',
        title: '场地预订',
        amount: 20000,
        category: 'venue',
        date: '2024-03-20',
        description: '婚礼场地押金',
        paymentMethod: 'card'
      },
      {
        id: '3',
        title: '婚纱摄影',
        amount: 8000,
        category: 'photography',
        date: '2024-03-18',
        description: '婚纱照拍摄费用',
        paymentMethod: 'cash'
      },
      {
        id: '4',
        title: '礼服定制',
        amount: 5000,
        category: 'clothing',
        date: '2024-03-15',
        description: '新娘礼服定制',
        paymentMethod: 'card'
      }
    ]
    setExpenses(mockExpenses)
  }

  const createExpense = () => {
    Taro.navigateTo({
      url: '/pages/expense/create'
    })
  }

  const viewDetail = (expenseId: string) => {
    Taro.navigateTo({
      url: `/pages/expense/detail?id=${expenseId}`
    })
  }

  // 过滤花费记录
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.title.toLowerCase().includes(searchValue.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // 分类数据
  const categories = [
    { key: 'all', label: '全部', icon: 'folder' },
    { key: 'venue', label: '场地', icon: 'home' },
    { key: 'photography', label: '摄影', icon: 'camera' },
    { key: 'clothing', label: '服装', icon: 'tag' },
    { key: 'decoration', label: '装饰', icon: 'star' },
    { key: 'food', label: '餐饮', icon: 'shopping-cart' },
    { key: 'transportation', label: '交通', icon: 'car' },
    { key: 'other', label: '其他', icon: 'more' }
  ]

  // 统计数据
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <View className='expense-list'>
      {/* 头部 */}
      <View className='header'>
        <Text className='title'>花费记录</Text>
        <AtButton 
          type='primary'
          size='small'
          onClick={createExpense}
          className='add-btn'
        >
          <AtIcon value='add' size='14' color='#fff' />
          <Text>记录</Text>
        </AtButton>
      </View>

      {/* 统计卡片 */}
      <AtCard className='stats-card'>
        <View className='stats-content'>
          <View className='stat-item'>
            <AtIcon value='credit-card' size='20' color='#ff6b6b' />
            <Text className='stat-label'>总支出</Text>
            <Text className='stat-value'>¥{formatMoney(totalAmount)}</Text>
          </View>
          <View className='stat-item'>
            <AtIcon value='bookmark' size='20' color='#4ecdc4' />
            <Text className='stat-label'>记录数</Text>
            <Text className='stat-value'>{filteredExpenses.length}</Text>
          </View>
        </View>
      </AtCard>

      {/* 搜索栏 */}
      <View className='search-section'>
        <AtSearchBar
          value={searchValue}
          onChange={(value) => setSearchValue(value)}
          onClear={() => setSearchValue('')}
          placeholder='搜索花费记录...'
          className='search-bar'
        />
      </View>

      {/* 分类筛选 */}
      <View className='category-section'>
        <View className='category-tabs'>
          {categories.map((category) => (
            <View
              key={category.key}
              className={`category-tab ${selectedCategory === category.key ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.key)}
            >
              <AtIcon 
                value={category.icon} 
                size='16' 
                color={selectedCategory === category.key ? '#ff6b6b' : '#999'} 
              />
              <Text>{category.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 花费列表 */}
      <View className='content'>
        {filteredExpenses.length === 0 ? (
          <View className='empty-state'>
            <AtIcon value='file' size='60' color='#ddd' />
            <Text className='empty-title'>
              {searchValue ? '没有找到相关花费记录' : '暂无花费记录'}
            </Text>
            <Text className='empty-desc'>
              {searchValue ? '试试其他关键词' : '记录你的第一笔花费吧'}
            </Text>
            <AtButton 
              type='primary' 
              size='normal'
              onClick={createExpense}
              className='empty-btn'
              circle
            >
              <AtIcon value='add' size='16' color='#fff' />
              <Text>立即记录</Text>
            </AtButton>
          </View>
        ) : (
          <AtList>
            {filteredExpenses.map((expense) => (
              <AtListItem
                key={expense.id}
                title={expense.title}
                note={expense.date}
                extraText={`¥${formatMoney(expense.amount)}`}
                iconInfo={{
                  value: 'tag',
                  color: '#ff9800',
                  size: '20'
                }}
                arrow='right'
                onClick={() => viewDetail(expense.id)}
              >
                <AtTag 
                  type='primary' 
                  size='small'
                  circle
                >
                  {getExpenseCategoryLabel(expense.category)}
                </AtTag>
              </AtListItem>
            ))}
          </AtList>
        )}
      </View>

      {/* 悬浮按钮 */}
      <AtFab onClick={createExpense}>
        <AtIcon value='add' size='20' color='#fff' />
      </AtFab>
    </View>
  )
}

export default ExpenseList
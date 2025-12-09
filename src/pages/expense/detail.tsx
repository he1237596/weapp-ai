import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { 
  AtCard, 
  AtButton, 
  AtIcon,
  AtTag,
  AtDivider,
  AtList,
  AtListItem
} from 'taro-ui'
import { getExpenseCategoryLabel, formatMoney } from '../../utils/common'
import './detail.scss'

interface Expense {
  id: string
  title: string
  amount: number
  category: string
  date: string
  description: string
  paymentMethod: string
  receipt?: string
}

const ExpenseDetail = () => {
  const [expense, setExpense] = useState<Expense | null>(null)

  useEffect(() => {
    loadExpenseDetail()
  }, [])

  const loadExpenseDetail = () => {
    const mockExpense: Expense = {
      id: '1',
      title: '婚礼场地预订',
      amount: 20000,
      category: 'venue',
      date: '2024-01-15',
      description: '预订五星级酒店婚礼场地，包含宴会厅和仪式厅',
      paymentMethod: 'card',
      receipt: 'receipt.jpg'
    }
    setExpense(mockExpense)
  }

  const editExpense = () => {
    Taro.showToast({
      title: '编辑功能开发中',
      icon: 'none'
    })
  }

  const deleteExpense = () => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条花费记录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({
            title: '删除成功',
            icon: 'success'
          })
          setTimeout(() => {
            Taro.navigateBack()
          }, 1500)
        }
      }
    })
  }

  if (!expense) {
    return (
      <View className='loading'>
        <Text>加载中...</Text>
      </View>
    )
  }

  return (
    <View className='expense-detail'>
      <AtCard className='detail-card'>
        {/* 头部信息 */}
        <View className='expense-header'>
          <View className='expense-title'>
            <AtIcon value='tag' size='24' color='#ff6b6b' />
            <Text>{expense.title}</Text>
          </View>
          <AtTag type='primary' size='small' circle>
            {getExpenseCategoryLabel(expense.category)}
          </AtTag>
        </View>

        <AtDivider />

        {/* 花费金额 */}
        <View className='amount-section'>
          <Text className='amount-label'>花费金额</Text>
          <Text className='amount-value'>¥{formatMoney(expense.amount)}</Text>
        </View>

        <AtDivider />

        {/* 详细信息 */}
        <View className='expense-details'>
          <AtList>
            <AtListItem
              title='消费分类'
              note={expense.category}
              iconInfo={{ value: 'folder', size: 16, color: '#1890ff' }}
            />
            <AtListItem
              title='消费日期'
              note={expense.date}
              iconInfo={{ value: 'calendar', size: 16, color: '#52c41a' }}
            />
            <AtListItem
              title='支付方式'
              note={expense.paymentMethod}
              iconInfo={{ value: 'credit-card', size: 16, color: '#fa8c16' }}
            />
            <AtListItem
              title='备注说明'
              note={expense.description}
              iconInfo={{ value: 'file-text', size: 16, color: '#722ed1' }}
              arrow={false}
            />
          </AtList>
        </View>

        <AtDivider />

        {/* 操作按钮 */}
        <View className='actions'>
          <AtButton 
            type='secondary'
            size='large'
            onClick={editExpense}
            className='action-btn edit-btn'
          >
            <AtIcon value='edit' size='16' />
            <Text>编辑</Text>
          </AtButton>
          <AtButton 
            type='primary'
            size='large'
            onClick={deleteExpense}
            className='action-btn delete-btn'
          >
            <AtIcon value='delete' size='16' />
            <Text>删除</Text>
          </AtButton>
        </View>
      </AtCard>
    </View>
  )
}

export default ExpenseDetail
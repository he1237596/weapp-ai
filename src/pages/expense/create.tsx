import { useState, useEffect } from 'react'
import { View, Text, Button, Input, Textarea } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { ExpenseService, TaskService } from '../../services/database'
import './create.scss'

interface FormData {
  title: string
  description: string
  amount: string
  category: string
  payment_method: string
  receipt_url: string
  task_id?: string
}

interface Task {
  id: string
  title: string
}

const CreateExpense = () => {
  const router = useRouter()
  const { eventId, taskId } = router.params
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    amount: '',
    category: 'other',
    payment_method: '现金',
    receipt_url: '',
    task_id: taskId || ''
  })
  const [loading, setLoading] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    loadTasks()
  }, [eventId])

  const loadTasks = async () => {
    try {
      if (!eventId) return

      const tasks = await TaskService.getEventTasks(eventId)
      setTasks(tasks)
    } catch (error) {
      console.error('加载任务列表失败:', error)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  const handleAmountInput = (e: any) => {
    const value = e.detail.value
    // 只允许数字和一位小数点
    const sanitizedValue = value.replace(/[^\d.]/g, '').replace(/\.+/g, '.')
    handleInputChange('amount', sanitizedValue)
  }

  const chooseReceipt = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        handleInputChange('receipt_url', res.tempFilePaths[0])
        Taro.showToast({
          title: '收据已选择',
          icon: 'success'
        })
      }
    })
  }

  const handleSubmit = async () => {
    try {
      // 验证表单
      if (!formData.title.trim()) {
        Taro.showToast({
          title: '请填写支出项目',
          icon: 'none'
        })
        return
      }

      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        Taro.showToast({
          title: '请填写有效金额',
          icon: 'none'
        })
        return
      }

      setLoading(true)

      // 获取当前用户
      const currentUser = Taro.getStorageSync('currentUser') || { id: 'user1' }

      // 创建支出记录
      await ExpenseService.createExpense({
        event_id: eventId,
        task_id: taskId || null,
        title: formData.title,
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        payment_method: formData.payment_method,
        paid_by: currentUser.id,
        receipt_url: formData.receipt_url || null
      })

      setLoading(false)

      Taro.showToast({
        title: '添加成功',
        icon: 'success'
      })

      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)

    } catch (error) {
      console.error('创建支出失败:', error)
      setLoading(false)
      
      Taro.showToast({
        title: '添加失败',
        icon: 'error'
      })
    }
  }

  const categories = [
    { value: 'hotel', label: '酒店' },
    { value: 'clothing', label: '服装' },
    { value: 'photography', label: '摄影' },
    { value: 'catering', label: '餐饮' },
    { value: 'decoration', label: '装饰' },
    { value: 'transportation', label: '交通' },
    { value: 'gift', label: '礼品' },
    { value: 'entertainment', label: '娱乐' },
    { value: 'document', label: '证件' },
    { value: 'other', label: '其他' }
  ]

  const paymentMethods = [
    { value: '现金', label: '现金' },
    { value: '微信', label: '微信' },
    { value: '支付宝', label: '支付宝' },
    { value: '银行卡', label: '银行卡' },
    { value: '信用卡', label: '信用卡' },
    { value: '其他', label: '其他' }
  ]

  return (
    <View className='create-expense'>
      {/* 顶部栏 */}
      <View className='header'>
        <Button className='back-btn' onClick={() => Taro.navigateBack()}>
          <Text className='arrow'>‹</Text>
        </Button>
        <Text className='title'>添加支出</Text>
        <View className='header-space'></View>
      </View>

      {/* 表单内容 */}
      <View className='form-container'>
        {/* 关联任务 */}
        {taskId && (
          <View className='form-section'>
            <Text className='section-label'>关联任务</Text>
            <View className='task-info'>
              <Text>已关联到指定任务</Text>
            </View>
          </View>
        )}

        {!taskId && tasks.length > 0 && (
          <View className='form-section'>
            <Text className='section-label'>关联任务（可选）</Text>
            <View className='task-selector'>
              {tasks.map(task => (
                <Button
                  key={task.id}
                  className={`task-option ${formData.task_id === task.id ? 'active' : ''}`}
                  onClick={() => handleInputChange('task_id', task.id)}
                >
                  {task.title}
                </Button>
              ))}
            </View>
          </View>
        )}

        {/* 支出项目 */}
        <View className='form-section'>
          <Text className='section-label'>支出项目 *</Text>
          <Input
            className='form-input'
            placeholder='请输入支出项目名称'
            value={formData.title}
            onInput={(e) => handleInputChange('title', e.detail.value)}
          />
        </View>

        {/* 描述 */}
        <View className='form-section'>
          <Text className='section-label'>描述</Text>
          <Textarea
            className='form-textarea'
            placeholder='请输入支出描述（可选）'
            value={formData.description}
            onInput={(e) => handleInputChange('description', e.detail.value)}
            maxLength={200}
          />
        </View>

        {/* 金额 */}
        <View className='form-section'>
          <Text className='section-label'>金额 *</Text>
          <View className='amount-input-wrapper'>
            <Text className='currency-symbol'>¥</Text>
            <Input
              className='amount-input'
              type='digit'
              placeholder='0.00'
              value={formData.amount}
              onInput={handleAmountInput}
            />
          </View>
        </View>

        {/* 分类 */}
        <View className='form-section'>
          <Text className='section-label'>分类</Text>
          <View className='category-grid'>
            {categories.map(category => (
              <Button
                key={category.value}
                className={`category-option ${formData.category === category.value ? 'active' : ''}`}
                onClick={() => handleInputChange('category', category.value)}
              >
                {category.label}
              </Button>
            ))}
          </View>
        </View>

        {/* 支付方式 */}
        <View className='form-section'>
          <Text className='section-label'>支付方式</Text>
          <View className='payment-methods'>
            {paymentMethods.map(method => (
              <Button
                key={method.value}
                className={`payment-option ${formData.payment_method === method.value ? 'active' : ''}`}
                onClick={() => handleInputChange('payment_method', method.value)}
              >
                {method.label}
              </Button>
            ))}
          </View>
        </View>

        {/* 收据照片 */}
        <View className='form-section'>
          <Text className='section-label'>收据照片</Text>
          <View className='receipt-section'>
            {formData.receipt_url ? (
              <View className='receipt-preview'>
                <image
                  className='receipt-image'
                  src={formData.receipt_url}
                  mode='aspectFit'
                />
                <Button
                  className='remove-receipt'
                  onClick={() => handleInputChange('receipt_url', '')}
                >
                  删除
                </Button>
              </View>
            ) : (
              <Button className='upload-receipt' onClick={chooseReceipt}>
                <Text className='upload-icon'>📷</Text>
                <Text>选择收据照片</Text>
              </Button>
            )}
          </View>
        </View>
      </View>

      {/* 提交按钮 */}
      <View className='submit-section'>
        <Button
          className='submit-btn'
          onClick={handleSubmit}
          loading={loading}
          disabled={loading}
        >
          {loading ? '保存中...' : '保存支出'}
        </Button>
      </View>
    </View>
  )
}

export default CreateExpense
import { useState, useEffect } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './detail.scss'

interface Task {
  id: string
  title: string
  priority: string
}

interface Budget {
  total: number
  categories: Record<string, number>
}

interface Template {
  id: string
  title: string
  description: string
  category: string
  tasks: Task[]
  budget: Budget
  usageCount: number
  rating: number
}

const TemplateDetail = () => {
  const [template, setTemplate] = useState<Template | null>(null)

  useEffect(() => {
    loadTemplateDetail()
  }, [])

  const loadTemplateDetail = () => {
    setTemplate({
      id: '1',
      title: '婚礼策划模板',
      description: '完整的婚礼策划流程，包括场地预订、婚纱选择、宾客邀请等',
      category: 'wedding',
      tasks: [
        { id: '1', title: '确定婚礼日期和预算', priority: 'high' },
        { id: '2', title: '预订婚礼场地', priority: 'high' },
        { id: '3', title: '选择婚纱礼服', priority: 'medium' },
        { id: '4', title: '发送邀请函', priority: 'medium' }
      ],
      budget: {
        total: 100000,
        categories: {
          venue: 30000,
          catering: 25000,
          photography: 15000,
          clothing: 20000,
          other: 10000
        }
      },
      usageCount: 156,
      rating: 4.8
    })
  }

  const useTemplate = () => {
    Taro.showModal({
      title: '使用模板',
      content: '确定要使用这个模板吗？将为您创建相应的活动。',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({
            title: '模板使用成功',
            icon: 'success'
          })
          setTimeout(() => {
            Taro.switchTab({
              url: '/pages/index/index'
            })
          }, 1500)
        }
      }
    })
  }

  if (!template) {
    return <View className='loading'><Text>加载中...</Text></View>
  }

  return (
    <View className='template-detail'>
      <View className='header'>
        <Text className='title'>{template.title}</Text>
        <View className='stats'>
          <Text className='rating'>⭐ {template.rating}</Text>
          <Text className='usage'>使用 {template.usageCount} 次</Text>
        </View>
      </View>

      <View className='content'>
        <View className='section'>
          <Text className='section-title'>模板描述</Text>
          <Text className='description'>{template.description}</Text>
        </View>

        <View className='section'>
          <Text className='section-title'>预算建议</Text>
          <Text className='total-budget'>总预算：¥{template.budget.total}</Text>
          <View className='budget-breakdown'>
            {Object.entries(template.budget.categories).map(([key, amount]) => (
              <View key={key} className='budget-item'>
                <Text className='category'>{key}：</Text>
                <Text className='amount'>¥{amount}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='section'>
          <Text className='section-title'>任务清单</Text>
          {template.tasks.map(task => (
            <View key={task.id} className='task-item'>
              <Text className='task-title'>• {task.title}</Text>
              <Text className={`priority ${task.priority}`}>
                {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
              </Text>
            </View>
          ))}
        </View>

        <Button className='use-template-btn' onClick={useTemplate}>
          使用此模板
        </Button>
      </View>
    </View>
  )
}

export default TemplateDetail
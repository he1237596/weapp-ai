import { useState } from 'react'
import { View, Text, Button, Input, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { generateId } from '../../utils/common'
import { FormData } from '../../types'
import './create.scss'

interface CreateTaskState {
  formData: FormData
  submitLoading: boolean
}

interface FormData {
  title: string
  description: string
  priority: string
}

const CreateTask = () => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    priority: 'normal'
  })
  const [submitLoading, setSubmitLoading] = useState(false)

  const handleInput = (field: keyof FormData, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Taro.showToast({
        title: '请输入任务标题',
        icon: 'none'
      })
      return
    }

    setSubmitLoading(true)

    try {
      // 模拟保存任务
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      Taro.showToast({
        title: '创建成功',
        icon: 'success'
      })

      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch (error) {
      Taro.showToast({
        title: '创建失败',
        icon: 'none'
      })
    } finally {
      setSubmitLoading(false)
    }
  }

  const priorityOptions = ['低', '中', '高']

  return (
    <View className='create-task'>
      <View className='header'>
        <Text className='title'>创建任务</Text>
      </View>

      <View className='form'>
        <View className='form-item'>
          <Text className='label'>任务标题 *</Text>
          <Input
            className='input'
            placeholder='请输入任务标题'
            value={formData.title}
            onInput={(e) => handleInput('title', e.detail.value)}
          />
        </View>

        <View className='form-item'>
          <Text className='label'>任务描述</Text>
          <Input
            className='input'
            placeholder='请输入任务描述'
            value={formData.description}
            onInput={(e) => handleInput('description', e.detail.value)}
          />
        </View>

        <View className='form-item'>
          <Text className='label'>优先级</Text>
          <Picker
            mode='selector'
            range={priorityOptions}
            value={2}
            onChange={(e) => handleInput('priority', ['low', 'normal', 'high'][e.detail.value])}
          >
            <View className='picker'>
              <Text>{priorityOptions[2]}</Text>
            </View>
          </Picker>
        </View>

        <Button
          className='submit-btn'
          type='primary'
          loading={submitLoading}
          onClick={handleSubmit}
        >
          {submitLoading ? '创建中...' : '创建任务'}
        </Button>
      </View>
    </View>
  )
}

export default CreateTask
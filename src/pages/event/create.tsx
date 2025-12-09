import { useState } from 'react'
import { View, Text, Button, Input, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { generateId } from '../../utils/common'
import './create.scss'

interface Process {
  id: string
  name: string
  checked: boolean
  isNew?: boolean
}

interface FormData {
  title: string
  startDate: string
  budget: string
  coverImage: string
}

const CreateEvent = () => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    startDate: '',
    budget: '',
    coverImage: ''
  })
  const [defaultProcesses, setDefaultProcesses] = useState<Process[]>([
    { id: '1', name: '婚纱拍摄', checked: true },
    { id: '2', name: '宴席酒店', checked: true },
    { id: '3', name: '证件办理', checked: true },
    { id: '4', name: '婚纱礼服', checked: true }
  ])
  const [submitLoading, setSubmitLoading] = useState(false)

  const handleInput = (field: keyof FormData, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  const handleDateChange = (e: any) => {
    const date = new Date(e.detail.value)
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    handleInput('startDate', formattedDate)
  }

  const toggleProcess = (processId: string) => {
    const updatedProcesses = defaultProcesses.map(process => 
      process.id === processId 
        ? { ...process, checked: !process.checked }
        : process
    )
    setDefaultProcesses(updatedProcesses)
  }

  const addCustomProcess = () => {
    const newProcess = {
      id: generateId(),
      name: '',
      checked: false,
      isNew: true
    }
    setDefaultProcesses([...defaultProcesses, newProcess])
  }

  const updateCustomProcess = (processId: string, value: string) => {
    const updatedProcesses = defaultProcesses.map(process => 
      process.id === processId 
        ? { ...process, name: value }
        : process
    )
    setDefaultProcesses(updatedProcesses)
  }

  const uploadCoverImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        handleInput('coverImage', res.tempFilePaths[0])
      },
      fail: () => {
        Taro.showToast({
          title: '选择图片失败',
          icon: 'none'
        })
      }
    })
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Taro.showToast({
        title: '请输入事件名称',
        icon: 'none'
      })
      return
    }

    if (!formData.startDate) {
      Taro.showToast({
        title: '请选择开始时间',
        icon: 'none'
      })
      return
    }

    setSubmitLoading(true)

    try {
      const event = {
        id: generateId(),
        title: formData.title,
        startDate: formData.startDate,
        budget: parseFloat(formData.budget) || 0,
        coverImage: formData.coverImage,
        processes: defaultProcesses.filter(p => p.checked).map(p => ({
          id: generateId(),
          name: p.name,
          status: 'pending',
          cost: 0
        })),
        progress: 0,
        status: 'planning',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // 模拟保存
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      Taro.showToast({
        title: '创建成功',
        icon: 'success'
      })

      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('创建事件失败:', error)
      Taro.showToast({
        title: '创建失败',
        icon: 'none'
      })
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <View className='create-event'>
      {/* 标题 */}
      <View className='header'>
        <Text className='title'>创建新事件</Text>
      </View>

      {/* 表单区 */}
      <View className='form-section'>
        <View className='form-item'>
          <Text className='label'>事件名称</Text>
          <Input
            className='input'
            placeholder='请输入事件名称'
            value={formData.title}
            onInput={(e) => handleInput('title', e.detail.value)}
          />
        </View>

        <View className='form-item'>
          <Text className='label'>开始时间</Text>
          <Picker
            mode='date'
            value={formData.startDate}
            onChange={handleDateChange}
          >
            <View className='picker-input'>
              <Text className={formData.startDate ? 'picker-text' : 'placeholder'}>
                {formData.startDate || '请选择开始时间'}
              </Text>
            </View>
          </Picker>
        </View>

        <View className='form-item'>
          <Text className='label'>预算</Text>
          <Input
            className='input'
            type='number'
            placeholder='请输入预算（可选）'
            value={formData.budget}
            onInput={(e) => handleInput('budget', e.detail.value)}
          />
        </View>

        <View className='form-item'>
          <Text className='label'>事件封面图</Text>
          <View className='upload-section'>
            {formData.coverImage ? (
              <View className='image-preview' onClick={uploadCoverImage}>
                <image src={formData.coverImage} mode='aspectFill' />
                <View className='overlay'>
                  <Text className='change-text'>更换</Text>
                </View>
              </View>
            ) : (
              <View className='upload-btn' onClick={uploadCoverImage}>
                <Text className='upload-icon'>📷</Text>
                <Text className='upload-text'>点击上传</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* 默认流程 */}
      <View className='process-section'>
        <Text className='section-title'>默认流程序列（可添加自定义）</Text>
        
        <View className='process-list'>
          {defaultProcesses.map(process => (
            <View key={process.id} className='process-item'>
              <View className='process-left'>
                <View 
                  className={`checkbox ${process.checked ? 'checked' : ''}`}
                  onClick={() => toggleProcess(process.id)}
                >
                  <Text className='check-icon'>
                    {process.checked ? '✔️' : ''}
                  </Text>
                </View>
                {process.isNew ? (
                  <Input
                    className='process-input'
                    placeholder='输入流程名称'
                    value={process.name}
                    onInput={(e) => updateCustomProcess(process.id, e.detail.value)}
                  />
                ) : (
                  <Text className='process-name'>{process.name}</Text>
                )}
              </View>
              {!process.isNew && (
                <Text className='process-arrow'>{'>'}</Text>
              )}
            </View>
          ))}
          
          <View className='add-process-btn' onClick={addCustomProcess}>
            <Text className='add-icon'>＋</Text>
            <Text className='add-text'>添加更多流程</Text>
          </View>
        </View>
      </View>

      {/* 底部按钮 */}
      <View className='bottom-actions'>
        <Button 
          className='cancel-btn'
          onClick={() => Taro.navigateBack()}
        >
          取消
        </Button>
        <Button
          className='submit-btn'
          type='primary'
          loading={submitLoading}
          onClick={handleSubmit}
        >
          {submitLoading ? '创建中...' : '创建事件'}
        </Button>
      </View>
    </View>
  )
}

export default CreateEvent
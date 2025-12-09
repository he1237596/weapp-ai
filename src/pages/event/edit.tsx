import { useState, useEffect } from 'react'
import { View, Text, Button, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './edit.scss'

const EditEvent = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    // 模拟加载数据
    setTitle('婚礼活动')
    setDescription('这是一个重要的活动')
  }, [])

  const handleSave = () => {
    Taro.showToast({
      title: '保存成功',
      icon: 'success'
    })
    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
  }

  return (
    <View className='edit-event'>
      <View className='header'>
        <Text className='title'>编辑活动</Text>
      </View>

      <View className='form'>
        <View className='form-item'>
          <Text className='label'>活动标题</Text>
          <Input
            className='input'
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
          />
        </View>

        <View className='form-item'>
          <Text className='label'>活动描述</Text>
          <Input
            className='input'
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
          />
        </View>

        <Button className='save-btn' onClick={handleSave}>
          保存
        </Button>
      </View>
    </View>
  )
}

export default EditEvent
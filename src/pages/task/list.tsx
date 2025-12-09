import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtButton, AtIcon, AtList, AtListItem } from 'taro-ui'
import './list.scss'

interface Task {
  id: string
  title: string
  completed: boolean
}

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = () => {
    const mockTasks: Task[] = [
      { id: '1', title: '预订场地', completed: false },
      { id: '2', title: '选择婚纱', completed: true },
      { id: '3', title: '确定宾客名单', completed: false },
      { id: '4', title: '预订婚宴', completed: false },
      { id: '5', title: '安排交通', completed: true }
    ]
    setTasks(mockTasks)
  }

  const createTask = () => {
    Taro.navigateTo({
      url: '/pages/task/create'
    })
  }

  const toggleTask = (taskId: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed }
        : task
    )
    setTasks(updatedTasks)
  }

  const viewDetail = (taskId: string) => {
    Taro.navigateTo({
      url: `/pages/task/detail?id=${taskId}`
    })
  }

  return (
    <View className='task-list'>
      {/* 头部 */}
      <View className='header'>
        <Text className='title'>任务清单</Text>
        <AtButton 
          type='primary'
          size='small'
          onClick={createTask}
          className='add-btn'
        >
          <AtIcon value='add' size='14' color='#fff' />
          <Text>添加</Text>
        </AtButton>
      </View>

      {/* 内容 */}
      <View className='content'>
        {tasks.length === 0 ? (
          <View className='empty-state'>
            <AtIcon value='file' size='60' color='#ddd' />
            <Text className='empty-title'>暂无任务</Text>
            <Text className='empty-desc'>创建你的第一个任务吧</Text>
            <AtButton 
              type='primary' 
              size='normal'
              onClick={createTask}
              className='empty-btn'
              circle
            >
              <AtIcon value='add' size='16' color='#fff' />
              <Text>添加第一个任务</Text>
            </AtButton>
          </View>
        ) : (
          <AtList>
            {tasks.map((task) => (
              <AtListItem
                key={task.id}
                title={task.title}
                note={task.completed ? '已完成' : '进行中'}
                thumb=''
                iconInfo={{
                  value: task.completed ? 'check-circle' : 'clock',
                  color: task.completed ? '#52c41a' : '#fa8c16',
                  size: '20'
                }}
                arrow='right'
                onClick={() => viewDetail(task.id)}
              />
            ))}
          </AtList>
        )}
      </View>

      {/* 悬浮按钮 */}
      <View className='fab-btn' onClick={createTask}>
        <AtIcon value='add' size='20' color='#fff' />
      </View>
    </View>
  )
}

export default TaskList
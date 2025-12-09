// Zustand Store 使用示例

import { View, Text, Button } from '@tarojs/components'
import { useStore } from './useStore'

// 使用示例组件
const ExampleComponent = () => {
  // 从 store 中获取状态和 actions
  const { 
    user, 
    events, 
    tasks, 
    loading,
    // User actions
    setUser, 
    updateUser, 
    updateSettings,
    // Event actions  
    addEvent, 
    updateEvent,
    // Task actions
    addTask,
    toggleTaskStatus
  } = useStore()

  // 设置用户示例
  const handleSetUser = () => {
    setUser({
      name: '张三',
      avatar: '👤',
      phone: '13800138000',
      email: 'zhangsan@example.com'
    })
  }

  // 更新用户信息示例
  const handleUpdateUser = () => {
    updateUser({ name: '李四' })
  }

  // 添加事件示例
  const handleAddEvent = () => {
    addEvent({
      id: Date.now().toString(),
      title: '婚礼筹备',
      icon: '💑',
      progress: 0,
      startDate: new Date().toISOString(),
      budget: 100000,
      status: 'planning'
    })
  }

  // 添加任务示例
  const handleAddTask = () => {
    addTask({
      id: Date.now().toString(),
      title: '预定酒店',
      status: 'pending',
      cost: 30000,
      icon: '🏨',
      description: '预定婚礼场地和住宿',
      priority: 'high'
    })
  }

  // 切换任务状态示例
  const handleToggleTaskStatus = () => {
    if (tasks.length > 0) {
      const lastTask = tasks[tasks.length - 1]
      const newStatus = lastTask.status === 'pending' ? 'completed' : 'pending'
      toggleTaskStatus(lastTask.id, newStatus)
    }
  }

  return (
    <View className='example'>
      <Text>当前用户: {user ? user.name : '未登录'}</Text>
      <Text>加载状态: {loading ? '加载中...' : '已完成'}</Text>
      <Text>事件数量: {events.length}</Text>
      <Text>任务数量: {tasks.length}</Text>
      
      <Button onClick={handleSetUser}>设置用户</Button>
      <Button onClick={handleUpdateUser}>更新用户</Button>
      <Button onClick={handleAddEvent}>添加事件</Button>
      <Button onClick={handleAddTask}>添加任务</Button>
      <Button onClick={handleToggleTaskStatus}>切换任务状态</Button>
    </View>
  )
}

export default ExampleComponent

/*
使用说明:

1. 在任何组件中使用 store:
   const { user, events, tasks, setUser, addEvent } = useStore()

2. 常用 actions:
   - setUser(user): 设置用户信息
   - updateUser(userData): 更新用户信息
   - updateSettings(settings): 更新设置
   - addEvent(event): 添加事件
   - updateEvent(event): 更新事件
   - deleteEvent(eventId): 删除事件
   - addTask(task): 添加任务
   - updateTask(task): 更新任务
   - deleteTask(taskId): 删除任务
   - toggleTaskStatus(taskId, status): 切换任务状态
   - addPost(post): 添加社区帖子
   - addExpense(expense): 添加支出
   - addTemplate(template): 添加模板

3. 状态结构:
   - user: 用户信息
   - settings: 应用设置
   - events: 事件列表
   - tasks: 任务列表
   - posts: 社区帖子
   - expenses: 支出记录
   - templates: 模板列表

4. 相比 Redux 的优势:
   - 更简洁的 API
   - 无需 Provider 包装
   - 更少的样板代码
   - 更好的 TypeScript 支持
   - 无需 action creators 和 reducers
*/
# Redux 到 Zustand 迁移指南

## 迁移概述

本项目已成功从 Redux 迁移到 Zustand，简化了状态管理并减少了样板代码。

## 主要变更

### 1. 依赖包变更

**移除的依赖:**
- `@reduxjs/toolkit`
- `react-redux` 
- `@tarojs/redux`

**新增的依赖:**
- `zustand`

### 2. 文件结构变更

**删除的文件:**
- `src/store/index.ts` (Redux store 入口)
- `src/store/reducers/` 目录下的所有 reducer 文件
  - `task.ts`
  - `community.ts`
  - `event.ts`
  - `expense.ts`
  - `user.ts`
  - `template.ts`

**新增的文件:**
- `src/store/useStore.ts` (Zustand store)
- `src/store/example.tsx` (使用示例)

### 3. 代码变更

#### App.tsx 变更
```typescript
// 之前 (Redux)
import { Provider } from 'react-redux'
import store from './store'

const App = (props) => {
  return (
    <Provider store={store}>
      {props.children}
    </Provider>
  )
}

// 现在 (Zustand)
const App = (props) => {
  return (
    <>
      {props.children}
    </>
  )
}
```

## Zustand 使用方法

### 基本用法

```typescript
import { useStore } from '../store/useStore'

const MyComponent = () => {
  // 直接从 store 获取状态和 actions
  const { 
    user, 
    events, 
    tasks,
    setUser,
    addEvent,
    addTask 
  } = useStore()

  // 使用状态
  console.log('当前用户:', user)
  console.log('事件数量:', events.length)

  // 使用 actions
  const handleAddEvent = () => {
    addEvent({
      id: '1',
      title: '新事件',
      icon: '📅',
      progress: 0,
      startDate: new Date().toISOString(),
      budget: 10000,
      status: 'planning'
    })
  }

  return (
    <div>
      <button onClick={handleAddEvent}>添加事件</button>
    </div>
  )
}
```

### 选择性订阅 (性能优化)

```typescript
import { useStore } from '../store/useStore'

// 只订阅 user 状态，其他状态变化不会触发重渲染
const UserName = () => {
  const user = useStore(state => state.user)
  return <div>{user?.name}</div>
}

// 或者使用 shallow 比较来避免不必要的重渲染
import { shallow } from 'zustand/shallow'

const UserActions = () => {
  const { user, setUser, updateUser } = useStore(
    state => ({
      user: state.user,
      setUser: state.setUser,
      updateUser: state.updateUser
    }),
    shallow
  )
  // ...
}
```

## Zustand 相比 Redux 的优势

1. **更简洁的 API** - 无需 action creators 和 reducers
2. **无需 Provider** - 直接在任何组件中使用
3. **更少的样板代码** - 大幅减少代码量
4. **更好的 TypeScript 支持** - 内置类型推断
5. **更好的性能** - 支持选择性订阅
6. **易于学习** - API 简单直观

## 状态结构

新的 Zustand store 包含以下状态模块:

### User 用户模块
- `user`: 用户信息
- `loading`: 加载状态
- `settings`: 应用设置

### Event 事件模块  
- `events`: 事件列表
- `currentEvent`: 当前事件

### Task 任务模块
- `tasks`: 任务列表
- `currentTask`: 当前任务

### Community 社区模块
- `posts`: 帖子列表
- `currentPost`: 当前帖子

### Expense 支出模块
- `expenses`: 支出记录
- `currentExpense`: 当前支出
- `expenseCategories`: 支出分类

### Template 模板模块
- `templates`: 模板列表
- `currentTemplate`: 当前模板

## 常用 Actions

### 用户相关
- `setUser(user)` - 设置用户
- `updateUser(userData)` - 更新用户信息
- `clearUser()` - 清除用户
- `updateSettings(settings)` - 更新设置

### 事件相关
- `setEvents(events)` - 设置事件列表
- `addEvent(event)` - 添加事件
- `updateEvent(event)` - 更新事件
- `deleteEvent(eventId)` - 删除事件
- `setCurrentEvent(event)` - 设置当前事件

### 任务相关
- `setTasks(tasks)` - 设置任务列表
- `addTask(task)` - 添加任务
- `updateTask(task)` - 更新任务
- `deleteTask(taskId)` - 删除任务
- `toggleTaskStatus(taskId, status)` - 切换任务状态

### 社区相关
- `setPosts(posts)` - 设置帖子列表
- `addPost(post)` - 添加帖子
- `likePost(postId)` - 点赞帖子
- `unlikePost(postId)` - 取消点赞

### 支出相关
- `setExpenses(expenses)` - 设置支出列表
- `addExpense(expense)` - 添加支出记录
- `updateExpense(expense)` - 更新支出记录

### 模板相关
- `setTemplates(templates)` - 设置模板列表
- `addTemplate(template)` - 添加模板
- `updateTemplate(template)` - 更新模板

## 迁移检查清单

- [x] 移除 Redux 依赖包
- [x] 创建 Zustand store
- [x] 更新 App.tsx 移除 Provider
- [x] 删除旧的 Redux 文件
- [x] 编译测试通过
- [ ] 更新所有使用 Redux 的组件 (如果有的话)

## 注意事项

1. **持久化**: 如果需要状态持久化，可以使用 `zustand/persist`
2. **中间件**: Zustand 支持中间件，如 devtools 等
3. **类型安全**: 充分利用 TypeScript 的类型推断功能

## 下一步

如果有组件仍在使用 Redux，需要逐个迁移:

1. 找到使用 `useSelector` 或 `useDispatch` 的组件
2. 替换为 `useStore` hook
3. 更新相关的状态访问和 action 调用
4. 测试功能是否正常

---

迁移完成后，代码更简洁，维护成本更低，开发效率更高。
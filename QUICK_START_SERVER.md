# 快速开始：Supabase + Cloudflare 服务端

## 🚀 5分钟快速部署

### 前置要求
- Node.js 18+
- Supabase 账户
- Cloudflare 账户

### 步骤 1: 设置 Supabase
```bash
# 1. 访问 https://supabase.com 创建新项目
# 2. 记录 Project URL 和 API Keys
# 3. 在 SQL Editor 中执行: supabase/schema.sql
```

### 步骤 2: 配置环境变量
```bash
# 复制模板文件
cp .env.example .env

# 编辑 .env，填入你的配置
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_CLOUDFLARE_API_URL=https://api.yourdomain.com
```

### 步骤 3: 部署 Cloudflare Workers
```bash
cd cloudflare-workers
npm install

# 设置 secrets
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_KEY

# 部署
wrangler deploy --env production
```

### 步骤 4: 测试前端
```bash
cd ..
npm install
npm run dev:h5
```

## 📱 使用示例

### 在组件中使用 API
```typescript
import { useStore } from '../store/useStore'

const MyComponent = () => {
  const { 
    user, 
    events, 
    loading,
    signIn,
    loadEvents,
    createEvent,
    createTask 
  } = useStore()

  // 登录
  const handleSignIn = async () => {
    try {
      await signIn('user@example.com', 'password')
      console.log('登录成功')
    } catch (error) {
      console.error('登录失败:', error)
    }
  }

  // 加载事件列表
  useEffect(() => {
    if (user) {
      loadEvents()
    }
  }, [user])

  // 创建新事件
  const handleCreateEvent = async () => {
    try {
      const event = await createEvent({
        title: '我的婚礼',
        start_date: '2024-12-25',
        budget: 100000
      })
      console.log('事件创建成功:', event)
    } catch (error) {
      console.error('创建事件失败:', error)
    }
  }

  // 创建任务
  const handleCreateTask = async (eventId: string) => {
    try {
      const task = await createTask({
        event_id: eventId,
        title: '预定酒店',
        priority: 'high'
      })
      console.log('任务创建成功:', task)
    } catch (error) {
      console.error('创建任务失败:', error)
    }
  }

  return (
    <div>
      {user ? (
        <div>
          <h1>欢迎, {user.nickname}!</h1>
          <p>事件数量: {events.length}</p>
          <button onClick={handleCreateEvent}>创建事件</button>
          {events.map(event => (
            <div key={event.id}>
              <h3>{event.title}</h3>
              <button onClick={() => handleCreateTask(event.id)}>
                添加任务
              </button>
            </div>
          ))}
        </div>
      ) : (
        <button onClick={handleSignIn}>登录</button>
      )}
    </div>
  )
}
```

### 实时数据同步
```typescript
import { useStore } from '../store/useStore'
import { useEffect } from 'react'

const RealtimeComponent = () => {
  const { setupRealtime } = useStore()

  useEffect(() => {
    // 设置实时同步
    const cleanup = setupRealtime()
    
    // 组件卸载时清理订阅
    return cleanup
  }, [])

  return <div>实时数据已启用</div>
}
```

## 🔧 核心功能

### 用户认证
```typescript
const { signIn, signUp, signOut, user } = useStore()

// 注册
await signUp('new@example.com', 'password', '用户名')

// 登录
await signIn('user@example.com', 'password')

// 登出
await signOut()
```

### 事件管理
```typescript
const { events, loadEvents, createEvent, updateEvent } = useStore()

// 加载事件列表
await loadEvents()

// 创建事件
await createEvent({
  title: '婚礼',
  start_date: '2024-12-25',
  budget: 100000,
  status: 'planning'
})

// 更新事件
await updateEvent(eventId, {
  title: '修改后的标题',
  budget: 150000
})
```

### 任务管理
```typescript
const { tasks, loadTasks, createTask, toggleTaskStatus } = useStore()

// 加载任务
await loadTasks(eventId)

// 创建任务
await createTask({
  event_id: eventId,
  title: '预定场地',
  priority: 'high',
  due_date: '2024-11-01'
})

// 切换任务状态
await toggleTaskStatus(taskId, 'completed')
```

### 支出管理
```typescript
const { expenses, loadExpenses, createExpense } = useStore()

// 加载支出
await loadExpenses(eventId)

// 创建支出
await createExpense({
  event_id: eventId,
  amount: 30000,
  category: 'venue',
  description: '场地定金',
  date: '2024-10-01'
})
```

## 🎯 高级用法

### 选择性订阅 (性能优化)
```typescript
// 只订阅需要的状态，减少不必要的重渲染
const userName = useStore(state => state.user?.nickname)
const eventCount = useStore(state => state.events.length)
```

### 错误处理
```typescript
const { loadEvents } = useStore()

const handleLoadEvents = async () => {
  try {
    const events = await loadEvents()
    // 成功处理
  } catch (error) {
    // 错误处理
    console.error('加载事件失败:', error)
    Taro.showToast({
      title: '加载失败',
      icon: 'error'
    })
  }
}
```

### 文件上传
```typescript
const { uploadFile } = useStore()

const handleUpload = async (file: File) => {
  try {
    const result = await uploadFile(file, 'receipts')
    console.log('上传成功:', result.publicUrl)
    return result.publicUrl
  } catch (error) {
    console.error('上传失败:', error)
  }
}
```

## 📊 数据库表结构

### 主要表
- `users` - 用户信息
- `events` - 事件信息
- `event_members` - 事件成员关系
- `tasks` - 任务信息
- `expenses` - 支出记录
- `task_templates` - 任务模板
- `posts` - 社区帖子
- `notifications` - 通知信息

### 关系说明
```
users (1) ←→ (N) event_members ←→ (1) events
events (1) ←→ (N) tasks
events (1) ←→ (N) expenses
users (1) ←→ (N) posts
```

## 🛠 开发工具

### 本地开发
```bash
# 前端开发服务器
npm run dev:h5

# Cloudflare Workers 开发
cd cloudflare-workers
npm run dev
```

### 类型检查
```typescript
// 所有 API 调用都有完整的 TypeScript 支持
const event: Event = await createEvent({
  title: string,
  start_date: string,
  budget: number,
  // ... 其他字段自动提示
})
```

### 调试模式
```typescript
// 在 .env 中设置
NODE_ENV=development

// API 调用会在控制台显示详细日志
apiService.loadEvents() // 输出: [INFO] Loading events...
```

## 🚀 部署到生产环境

### 1. 环境变量配置
```env
NODE_ENV=production
REACT_APP_SUPABASE_URL=https://your-prod-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-prod-anon-key
REACT_APP_CLOUDFLARE_API_URL=https://api.yourdomain.com
```

### 2. 自动部署
```bash
# 使用脚本部署
./scripts/deploy.sh production

# 或使用 GitHub Actions (推送 main 分支自动触发)
git push origin main
```

### 3. 性能优化
- 启用 Cloudflare 缓存
- 配置 Supabase 连接池
- 使用 CDN 加速静态资源

## 🔍 监控和维护

### 日志查看
- Supabase Dashboard → Logs
- Cloudflare Dashboard → Analytics
- 前端控制台日志

### 性能监控
- Lighthouse CI 自动测试
- Cloudflare Analytics API 监控
- Supabase 查询性能分析

### 备份策略
- Supabase 自动备份 (每天)
- 手动导出重要数据
- 配置数据恢复计划

---

🎉 **恭喜！** 你现在已经拥有了一个完整的婚礼策划应用后端服务！

如果你遇到任何问题，请查看：
- [完整部署指南](./SUPABASE_CLOUDFLARE_SETUP.md)
- [Redux 到 Zustand 迁移指南](./REDUX_TO_ZUSTAND_MIGRATION.md)
- 项目 GitHub Issues
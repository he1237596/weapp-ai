# 登录和 Supabase 连接测试指南

## 🚀 快速开始测试

### 1. 配置环境变量

编辑 `.env` 文件（如果不存在，从 `.env.example` 复制）：

```env
# Supabase 配置
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# Cloudflare Workers API (可选)
REACT_APP_CLOUDFLARE_API_URL=https://api.yourdomain.com
```

### 2. 获取 Supabase 凭据

1. 访问 [supabase.com](https://supabase.com)
2. 进入你的项目
3. 在 Settings → API 中获取：
   - Project URL
   - anon public key
4. 更新 `.env` 文件中的对应值

### 3. 设置数据库

在 Supabase Dashboard 的 SQL Editor 中执行 `supabase/schema.sql`

### 4. 启动开发服务器

```bash
npm run dev:h5
```

## 🧪 测试登录功能

### 方法1: 使用登录页面

1. 打开浏览器访问 `http://localhost:10086`
2. 点击"登录"或"立即注册"
3. 输入邮箱和密码进行测试

### 方法2: 使用测试组件

暂时在首页添加测试组件（开发阶段）：

```typescript
// 在首页导入
import AuthTest from '../../components/AuthTest'

// 在渲染中添加
<AuthTest />
```

### 方法3: 直接在控制台测试

打开浏览器开发者工具，在控制台中：

```javascript
// 测试注册
import { useStore } from './store/useStore';
const store = useStore.getState();

store.signUp('test@example.com', 'password123', '测试用户')
  .then(result => console.log('注册成功:', result))
  .catch(error => console.error('注册失败:', error));

// 测试登录
store.signIn('test@example.com', 'password123')
  .then(result => console.log('登录成功:', result))
  .catch(error => console.error('登录失败:', error));
```

## 📊 测试数据流

### 1. 检查用户状态
```javascript
const { user, isAuthenticated } = useAuth();
console.log('当前用户:', user);
console.log('是否已认证:', isAuthenticated);
```

### 2. 测试事件管理
```javascript
const { createEvent, loadEvents } = useStore();

// 创建测试事件
createEvent({
  title: '测试婚礼',
  start_date: '2024-12-25',
  budget: 100000,
  status: 'planning'
}).then(result => console.log('事件创建成功:', result));

// 加载事件列表
loadEvents().then(events => console.log('事件列表:', events));
```

### 3. 测试实时同步
```javascript
const { setupRealtime } = useStore();

// 设置实时同步
const cleanup = setupRealtime();
console.log('实时同步已开启');
```

## 🔍 常见问题排查

### 问题1: 连接 Supabase 失败

**错误信息**: `Invalid URL or ANON key`

**解决方案**:
1. 检查 `.env` 文件中的 Supabase URL 和密钥是否正确
2. 确保没有多余的空格或引号
3. 验证 Supabase 项目是否处于活跃状态

### 问题2: 注册/登录失败

**错误信息**: `Invalid login credentials` 或 `User already registered`

**解决方案**:
1. 确认密码至少6位字符
2. 检查邮箱格式是否正确
3. 如果用户已存在，尝试直接登录

### 问题3: 数据加载失败

**错误信息**: `Rows permission denied` 或 `relation does not exist`

**解决方案**:
1. 确保已执行 `supabase/schema.sql`
2. 检查 RLS 策略是否正确设置
3. 验证用户是否有访问权限

### 问题4: 实时数据不更新

**可能原因**:
1. Supabase 实时功能未启用
2. JWT Token 过期
3. 网络连接问题

**解决方案**:
```javascript
// 检查连接状态
import { supabase } from './lib/supabase';

supabase.realtime.getChannels().forEach(channel => {
  console.log('频道状态:', channel.subscriptions);
});
```

## 🛠️ 调试技巧

### 1. 启用详细日志
```javascript
// 在开发环境中
if (process.env.NODE_ENV === 'development') {
  window.supabase = supabase; // 暴露到全局
}
```

### 2. 检查网络请求
```javascript
// 在浏览器网络面板中查看
// 请求URL: https://your-project.supabase.co/rest/v1/users
// 方法: GET/POST/PUT/DELETE
// 请求头: Authorization: Bearer xxx
```

### 3. 监控状态变化
```javascript
import { useStore } from './store/useStore';

// 监听状态变化
useStore.subscribe(
  (state) => state.user,
  (user) => console.log('用户状态变化:', user)
);
```

## 📱 微信小程序测试

### 1. 配置白名单
在 `project.config.json` 中添加：
```json
{
  "setting": {
    "urlCheck": false
  }
}
```

### 2. 调试模式
```javascript
// 开启调试模式
if (process.env.NODE_ENV === 'development') {
  console.log('微信小程序调试模式');
}
```

## 📋 测试检查清单

### 基础功能
- [ ] 用户可以注册新账户
- [ ] 用户可以使用邮箱密码登录
- [ ] 登录状态正确保存
- [ ] 用户可以成功登出
- [ ] 登录后可以访问受保护的页面

### 数据功能
- [ ] 可以创建新事件
- [ ] 事件列表正确显示
- [ ] 可以更新事件信息
- [ ] 可以删除事件
- [ ] 支出记录正常工作

### 实时功能
- [ ] 数据变更实时同步
- [ ] 多端数据一致性
- [ ] 网络断开/恢复处理
- [ ] 错误状态正确显示

### 安全性
- [ ] 未登录用户无法访问受保护数据
- [ ] 用户只能访问自己的数据
- [ ] API 调用包含正确的认证头
- [ ] 敏感信息不在前端暴露

## 🚨 错误代码参考

### Supabase 错误代码
- `PGRST116`: 表不存在 → 执行 schema.sql
- `42501`: 权限不足 → 检查 RLS 策略
- `23505`: 唯一约束冲突 → 数据已存在
- `28P01`: 外键约束 → 关联数据不存在

### HTTP 状态码
- `401`: 未认证 → 需要登录
- `403`: 权限不足 → 检查用户角色
- `404`: 资源不存在 → URL 或 ID 错误
- `429`: 请求过多 → 需要限制请求频率
- `500`: 服务器错误 → 联系技术支持

## 📞 获取帮助

### 1. 检查文档
- [完整部署指南](./SUPABASE_CLOUDFLARE_SETUP.md)
- [快速开始指南](./QUICK_START_SERVER.md)
- [Redux 到 Zustand 迁移指南](./REDUX_TO_ZUSTAND_MIGRATION.md)

### 2. 社区支持
- GitHub Issues: 报告 Bug
- Supabase Discord: 技术讨论
- Cloudflare Discord: Workers 相关问题

### 3. 日志收集
```javascript
// 收集错误日志
const logError = (error: Error, context?: string) => {
  console.error(`[${context}] Error:`, error);
  // 发送到日志服务
};
```

---

🎉 **测试完成后**，你将拥有一个完全功能的用户认证系统，连接到 Supabase 后端，支持实时数据同步！